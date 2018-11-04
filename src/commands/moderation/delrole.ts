/**
 * @file Moderation DeleteRoleCommand - Delete the role of a member  
 * **Aliases**: `deleterole`, `dr`, `remrole`, `removerole`
 * @module
 * @category moderation
 * @name delrole
 * @example delrole Favna Member
 * @param {GuildMemberResolvable} AnyMember The member to remove a role from
 * @param {RoleResolvable} AnyRole The role to remove
 * @returns {MessageEmbed} Delete role log
 */

import moment from 'moment';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DeleteRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'delrole',
      memberName: 'delrole',
      group: 'moderation',
      aliases: ['deleterole', 'dr', 'remrole', 'removerole'],
      description: 'Deletes a role from a member',
      format: 'MemberID|MemberName(partial or full) RoleID|RoleName(partial or full)',
      examples: ['delrole favna tagrole1'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I remove a role from?',
          type: 'member'
        },
        {
          key: 'role',
          prompt: 'What role should I remove from that member?',
          type: 'role'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  async run (msg, {member, role}) {
    try {
      if (!member.manageable) {
        return msg.reply(`looks like I do not have permission to edit the roles of ${member.displayName}. Better go and fix your server's role permissions if you want to use this command!`);
      }

      startTyping(msg);

      const modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
        roleRemoveEmbed = new MessageEmbed();

      await member.roles.remove(role);

      roleRemoveEmbed
        .setColor('#4A9E93')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`**Action:** Removed ${role.name} from ${member.displayName}`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
      (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
      This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: roleRemoveEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(roleRemoveEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      if ((/(?:Missing Permissions)/i).test(err.toString())) {

        return msg.reply(stripIndents`an error occurred adding the role \`${role.name}\` to \`${member.displayName}\`.
          Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
      } else if ((/(?:is not an array or collection of roles)/i).test(err.toString())) {
        return msg.reply(stripIndents`it looks like you supplied an invalid role to delete. If you are certain that the role is valid please feel free to open an issue on the GitHub.`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`deleterole\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** \`${role.name} (${role.id})\` || \`${member.user.tag} (${member.id})\`
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};