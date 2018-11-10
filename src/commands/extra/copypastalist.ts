/**
 * @file Extra CopyPastaListCommand - Gets all copypastas available to the server  
 * **Aliases**: `cplist`, `copylist`, `pastalist`
 * @module
 * @category extra
 * @name copypastalist
 * @returns {MessageEmbed} List of all available copypastas
 */

import * as Database from 'better-sqlite3';
import * as moment from 'moment';
import * as path from 'path';
import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Util, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { deleteCommandMessages, stopTyping, startTyping } from '../../components/util';

export default class CopyPastaListCommand extends Command {
  constructor (client : CommandoClient) {
    super(client, {
      name: 'copypastalist',
      memberName: 'copypastalist',
      group: 'extra',
      aliases: [ 'cplist', 'copylist', 'pastalist' ],
      description: 'Gets all copypastas available to the server',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  async run (msg : CommandMessage) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));

    try {
      startTyping(msg);

      const list = conn.prepare(`SELECT name FROM "${msg.guild.id}";`).all().map(p => p.name);

      if (list && list.length) {
        for (const entry in list) {
          list[entry] = `- \`${list[entry]}\``;
        }
      }

      deleteCommandMessages(msg, this.client);

      if (list.join('\n').length >= 1800) {
        const splitTotal = Util.splitMessage(stripIndents`${list.join('\n')}`, { maxLength: 1800 });

        for (const part of splitTotal) {
          await msg.embed({
            title: 'Copypastas available on this server',
            description: part,
            color: msg.guild.me.displayColor,
          });
        }
        stopTyping(msg);

        return null;
      }

      stopTyping(msg);

      return msg.embed({
        title: 'Copypastas available on this server',
        description: list.join('\n'),
        color: msg.guild.me.displayColor,
      });

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`copypastalist\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(`no copypastas found for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd\`!`);
    }
  }
}