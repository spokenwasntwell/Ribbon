/**
 * @file Extra CopyPastaAddCommand - Adds a new copypasta for your server  
 * **Aliases**: `cpadd`, `pastaadd`
 * @module
 * @category extra
 * @name copypastaadd
 * @example copypastaadd lipsum Lorem ipsum dolor sit amet.
 * @param {StringResolvable} PasteName Name for the new pasta
 * @param {StringResolvable} PastaContent Content for the new pasta
 * @returns {Message} Confirmation the copypasta was added
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class CopyPastaAddCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'copypastaadd',
      aliases: [ 'cpadd', 'pastaadd' ],
      group: 'extra',
      memberName: 'copypastaadd',
      description: 'Saves a copypasta to local file',
      format: 'CopypastaName CopypastaContent',
      examples: [ 'copypasta navy what the fuck did you just say to me ... (etc.)' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'What is the name of the copypasta you want to save?',
          type: 'string',
          parse: (p: string) => p.toLowerCase(),
        },
        {
          key: 'content',
          prompt: 'What should be stored in the copypasta?',
          type: 'string',
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { name, content }: {name: string, content: string}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));
    const pastaAddEmbed = new MessageEmbed();

    pastaAddEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setDescription(content);

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT name FROM "${msg.guild.id}" WHERE name = ?;`).get(name);

      if (query) {
        conn.prepare(`UPDATE "${msg.guild.id}" SET content=$content WHERE name=$name`).run({
          content,
          name,
        });

        pastaAddEmbed.setTitle(`Copypasta \`${name}\` Updated`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(pastaAddEmbed);
      }
      conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($name, $content);`).run({
        content,
        name,
      });
      pastaAddEmbed.setTitle(`Copypasta \`${name}\` Added`);

      stopTyping(msg);

      return msg.embed(pastaAddEmbed);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (name TEXT PRIMARY KEY, content TEXT);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($name, $content);`).run({
          content,
          name,
        });
        pastaAddEmbed.setTitle(`Copypasta \`${name}\` Added`);

        stopTyping(msg);

        return msg.embed(pastaAddEmbed);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`copypastaadd\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);

    }
  }
}