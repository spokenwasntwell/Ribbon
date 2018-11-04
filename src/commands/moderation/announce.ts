/**
 * @file Moderation NewsCommand - Make an announcement to a channel named "announcements" or "news"  
 * **Aliases**: `news`
 * @module
 * @category moderation
 * @name announce
 * @example announce Pokemon Switch has released!
 * @param {StringResolvable} Announcement The announcement you want to make
 * @returns {Message} Announcement you wrote in the announcement / news channel
 */

import moment from 'moment';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class NewsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'announce',
      memberName: 'announce',
      group: 'moderation',
      aliases: ['news'],
      description: 'Make an announcement in the news channel',
      format: 'Announcement',
      examples: ['announce John Appleseed reads the news'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'body',
          prompt: 'What do you want me to announce?',
          type: 'string'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {body}) {
    try {
      startTyping(msg);

      let announce = body,
        newsChannel = null;

      const announceEmbed = new MessageEmbed(),
        modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

      if (msg.guild.settings.get('announcechannel')) {
        newsChannel = msg.guild.channels.find(c => c.id === msg.guild.settings.get('announcechannel'));
      } else {
        msg.guild.channels.find(c => c.name === 'announcements')
          ? newsChannel = msg.guild.channels.find(c => c.name === 'announcements')
          : newsChannel = msg.guild.channels.find(c => c.name === 'news');
      }

      if (!newsChannel) throw new Error('nochannel');
      if (!newsChannel.permissionsFor(msg.guild.me).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) throw new Error('noperms');

      newsChannel.startTyping(1);

      announce.slice(0, 4) !== 'http' ? announce = `${body.slice(0, 1).toUpperCase()}${body.slice(1)}` : null;
      msg.attachments.first() && msg.attachments.first().url ? announce += `\n${msg.attachments.first().url}` : null;

      announceEmbed
        .setColor('#AAEFE6')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`**Action:** Made an announcement`)
        .setTimestamp();

      newsChannel.send(announce);
      newsChannel.stopTyping(true);

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                        (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                        This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: announceEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(announceEmbed);

    } catch (err) {
      stopTyping(msg);

      if ((/(?:nochannel)/i).test(err.toString())) {
        return msg.reply('there is no channel for me to make the announcement in. Create channel named either `announcements` or `news`');
      } else if ((/(?:noperms)/i).test(err.toString())) {
        return msg.reply('I do not have permission to send messages to the `announcements` or `news` channel. Better go fix that!');
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${body}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};