/**
 * @file Info IamCommand - Self Assign roles  
 * **Aliases**: `self`
 * @module
 * @category info
 * @name iam
 * @example iam uploader
 * @param {RoleResolvable} AnyRole The role you want to assign to yourself  
 * @returns {MessageEmbed} Confirmation the role has been assigned, will also be added to modlogs if enabled for the server
 */

import moment from 'moment';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class IamCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'iam',
      memberName: 'iam',
      group: 'info',
      aliases: ['self'],
      description: 'Self Assign roles',
      examples: ['iam uploader'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'role',
          prompt: 'Which role do you want to assign to yourself?',
          type: 'role'
        }
      ]
    });
  }

  async run (msg, {role, roleNames = []}) {
    try {
      if (!msg.member.manageable) {
        return msg.reply('looks like I do not have permission to edit your roles. The staff will have to fix the server\'s role permissions if you want to use this command!');
      }

      startTyping(msg);

      const modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
        roleAddEmbed = new MessageEmbed(),
        roles = msg.guild.settings.get('selfroles', []);

      if (!roles.length) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('this server has no self assignable roles');
      }

      roles.forEach(r => roleNames.push(msg.guild.roles.get(r).name));

      if (!roles.includes(role.id)) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(`that role is not self-assignable. The self-assignable roles are ${roleNames.map(val => `\`${val}\``).join(', ')}`);
      }

      await msg.member.roles.add(role);

      roleAddEmbed
        .setColor('#AAEFE6')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`**Action:** \`${msg.member.displayName}\` (\`${msg.author.id}\`) assigned \`${role.name}\` to themselves with the \`iam\` command`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
    (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
    This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: roleAddEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(roleAddEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Missing Permissions)/i).test(err.toString())) {
        return msg.reply(stripIndents`an error occurred adding the role \`${role.name}\` to you.
              The mods should check that I have \`Manage Roles\` permission and I am higher in hierarchy than the your roles?`);
      } else if ((/(?:is not an array or collection of roles)/i).test(err.toString())) {
        return msg.reply(stripIndents`it looks like you supplied an invalid role to add. If you are certain that the role is valid please feel free to open an issue on the GitHub.`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${role.name} (${role.id})\` || \`${msg.author.tag} (${msg.author.id})\`
        **Error Message:** ${err}
        `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
          Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};