/**
 * @file Leaderboards OsuCommand - Shows Player Stats for a given OSU player  
 * **Aliases**: `osustats`
 * @module
 * @category leaderboards
 * @name osu
 * @example osu WubWoofWolf
 * @param {StringResolvable} PlayerName Name of the OSU player
 * @returns {MessageEmbed} Stats of the player
 */

import {oneLine, stripIndents} from 'common-tags';
import {MessageEmbed, TextChannel} from 'discord.js';
import {Command, CommandMessage, CommandoClient} from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import * as querystring from 'querystring';
import {deleteCommandMessages, roundNumber, startTyping, stopTyping} from '../../components/util';

module.exports = class OsuCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'osu',
      memberName: 'osu',
      group: 'leaderboards',
      aliases: ['osustats'],
      description: 'Shows Player Stats for a given OSU player',
      format: 'PlayerName',
      examples: ['osu WubWoofWolf'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'player',
          prompt: 'Respond with the OSU Player name',
          type: 'string',
          parse: (p: string) => p.toLowerCase(),
        }
      ],
    });
  }

  public async run (msg: CommandMessage, {player}: {player: string}) {
    try {
      startTyping(msg);

      const res = await fetch(`https://osu.ppy.sh/api/get_user?${querystring.stringify({
          k: process.env.osukey,
          u: player,
          type: 'string',
        })}`, {headers: {'Content-Type': 'application/json'}});
      const osu = await res.json();
      const osuEmbed = new MessageEmbed();

      if (Object.values(osu[0]).includes(null)) throw new Error('noplayer');

      osuEmbed
        .setTitle(`OSU! Player Stats for ${osu[0].username} (${osu[0].user_id})`)
        .setURL(`https://new.ppy.sh/u/${osu[0].username}`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/osulogo.png')
        .setImage(`http://lemmmy.pw/osusig/sig.php?colour=hex7CFC00&uname=${osu[0].username}&flagshadow&darktriangles&avatarrounding=4&onlineindicator=undefined&xpbar&xpbarhex`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Perfects', osu[0].count300, true)
        .addField('Greats', osu[0].count100, true)
        .addField('Poors', osu[0].count50, true)
        .addField('Total Plays', osu[0].playcount, true)
        .addField('Level', roundNumber(osu[0].level), true)
        .addField('Accuracy', `${roundNumber(osu[0].accuracy, 2)}%`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(osuEmbed);
    } catch (err) {
      stopTyping(msg);
      if ((/(noplayer)/i).test(err.toString())) {
        return msg.reply(`no user found with username \`${player}\`.`);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`fortnite\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Player:** ${player}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};