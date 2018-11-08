/**
 * @file Casino WheelOfFortuneCommand - Gamble your chips at the wheel of fortune  
 * **Aliases**: `wheel`, `wof`
 * @module
 * @category casino
 * @name wheeloffortune
 * @example wof 5
 * @param {Number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the game
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components/util';

export default class WheelOfFortuneCommand extends Command {
  constructor (client : CommandoClient) {
    super(client, {
      name: 'wheeloffortune',
      memberName: 'wheeloffortune',
      group: 'casino',
      aliases: [ 'wheel', 'wof' ],
      description: 'Gamble your chips iat the wheel of fortune',
      format: 'AmountOfChips',
      examples: [ 'wof 50' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 5,
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
          type: 'integer',
          validate: (chips : number) => chips >= 1 && chips <= 1000000 ? true : 'Reply with a chips amount between 1 and 10000. Example: `10`',
          parse: (chips : number) => roundNumber(chips),
        }
      ],
    });
  }

  run (msg : CommandMessage, { chips }) {
    const arrowmojis = [ '⬆', '↖', '⬅', '↙', '⬇', '↘', '➡', '↗' ],
      conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      multipliers = [ 0.1, 0.2, 0.3, 0.5, 1.2, 1.5, 1.7, 2.4 ] as Array<number>,
      spin = Math.floor(Math.random() * multipliers.length) as number,
      wofEmbed = new MessageEmbed();

    wofEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        if (chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        const prevBal = query.balance;

        query.balance -= chips;
        query.balance += chips * multipliers[spin];
        query.balance = roundNumber(query.balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({ balance: query.balance });

        wofEmbed
          .setTitle(`${msg.author.tag} ${multipliers[spin] < 1
            ? `lost ${roundNumber(chips - (chips * multipliers[spin]))}` 
            : `won ${roundNumber((chips * multipliers[spin]) - chips)}`} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setDescription(`
  『${multipliers[1]}』   『${multipliers[0]}』   『${multipliers[7]}』
  
  『${multipliers[2]}』      ${arrowmojis[spin]}        『${multipliers[6]}』
  
  『${multipliers[3]}』   『${multipliers[4]}』   『${multipliers[5]}』
      `);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(wofEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`).run();

        return msg.reply(`looks like you don\'t have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`wheeloffortune\` command!
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