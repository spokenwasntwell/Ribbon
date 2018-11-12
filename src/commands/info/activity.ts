/**
 * @file Info ActivityCommand - Gets the activity (presence) data from a member  
 * **Aliases**: `act`, `presence`, `richpresence`
 * @module
 * @category info
 * @name activity
 * @example activity Favna
 * @param {GuildMemberResolvable} member Member to get the activity for
 * @returns {MessageEmbed} Activity from that member
 */

import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class ActivityCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'activity',
      memberName: 'activity',
      group: 'info',
      aliases: [ 'act', 'presence', 'richpresence' ],
      description: 'Gets the activity (presence) data from a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: [ 'activity Favna' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to get the activity from?',
          type: 'member',
        }
      ],
    });
  }

  /* tslint:disable: cyclomatic-complexity*/
  public async run (msg: CommandMessage, { member }: {member: GuildMember}) {
    try {
      startTyping(msg);
      const activity = member.presence.activity;
      const ava = member.user.displayAvatarURL();
      const embed = new MessageEmbed();
      const ext = this.fetchExt(ava);
      const games = await fetch('https://canary.discordapp.com/api/v6/applications');
      const gameList = await games.json();
      const gameIcon = gameList.find((g: any) => g.name === activity.name);

      let spotifyData: any = {};

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setAuthor(member.user.tag, ava, `${ava}?size2048`)
        .setThumbnail(ext.includes('gif') ? `${ava}&f=.gif` : ava);

      if (!activity) throw new Error('noActivity');
      if (activity.type === 'LISTENING' && activity.name === 'Spotify') {
        const tokenReq = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`).toString('base64')}`,
          },
          body: qs.stringify({
              grant_type: 'client_credentials',
          }),
        });
        const tokenRes = await tokenReq.json();
        const trackSearch = await fetch(`https://api.spotify.com/v1/search?${qs.stringify({
          q: activity.details,
          type: 'track',
          limit: '1'})}`, {
          method: 'GET',
          headers: {Authorization: `Bearer ${tokenRes.access_token}`}});
        const songInfo = await trackSearch.json();
        spotifyData = songInfo.tracks.items[0];
      }

      if (gameIcon) embed.setThumbnail(`https://cdn.discordapp.com/game-assets/${gameIcon.id}/${gameIcon.icon}.png`);
      embed.addField(this.convertType(activity.type), activity.name, true);

      if (activity.url) embed.addField('URL', `[${activity.url.slice(8)}](${activity.url})`, true);

      if (activity.details) {
        if (activity.type === 'LISTENING' && activity.name === 'Spotify') {
          embed.addField('Track', `[${activity.details}](${spotifyData.external_urls.spotify})`, true);
        } else {
          embed.addField('Details', activity.details, true);
        }
      }

      if (activity.state) {
        if (activity.type === 'LISTENING' && activity.name === 'Spotify') {
          embed.addField('Artist(s)', `${spotifyData.artists.map((artist: any) => `${artist.name}`).join(', ')}`, true);
        } else {
          embed.addField('State', activity.state, true);
        }
      }

      if (activity.party && activity.party.size) {
        embed.addField('Party Size', `${activity.party.size[0]} of ${activity.party.size[1]}`, true);
      }

      if (activity.assets) {
        embed.setThumbnail(!activity.assets.largeImage.includes('spotify')
        ? `https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.largeImage}.png`
        : `https://i.scdn.co/image/${activity.assets.largeImage.split(':')[1]}`);
      }

      if (activity.timestamps && activity.timestamps.start) {
        embed
          .setFooter('Start Time')
          .setTimestamp(activity.timestamps.start);
        if (activity.timestamps.end) embed.addField('End Time', `${moment.duration(moment(activity.timestamps.end).diff(Date.now())).format('H [hours], m [minutes] [and] s [seconds]')}`, true);
      }

      if (activity.assets && activity.assets.smallImage) {
        embed.setFooter(activity.assets.smallText
          ? activity.timestamps && activity.timestamps.start
            ? `${activity.assets.smallText} | Start Time`
            : activity.assets.smallText
          : activity.timestamps && activity.timestamps.start
            ? 'Start Time'
            : '​', !activity.assets.smallImage.includes('spotify')
          ? `https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.smallImage}.png`
          : `https://i.scdn.co/image/${activity.assets.smallImage.split(':')[1]}`);
      }

      if (activity.assets && activity.assets.largeText) {
        if (activity.type === 'LISTENING' && activity.name === 'Spotify') {
          embed.addField('Album', `[${activity.assets.largeText}](${spotifyData.album.external_urls.spotify})`, true);
        } else {
          embed.addField('Large Text', activity.assets.largeText, true);
        }
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      stopTyping(msg);
      if ((/(noActivity|Cannot read property 'name' of null)/i).test(err.toString())) {
        return msg.embed({
          color: msg.guild ? msg.guild.me.displayColor : 8190976,
          author: {
            name: member.user.tag,
            url: `${member.user.displayAvatarURL()}?size=2048`,
            iconURL: member.user.displayAvatarURL(),
          },
          thumbnail: { url: member.user.displayAvatarURL() },
          fields: [
            {
              name: 'Activity',
              value: 'Nothing',
              inline: true,
            }
          ],
        });
      }
      console.error(err);

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`fortnite\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Member:** ${member.user.tag} (${member.id})
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }

  private convertType (type: string) {
    return type.toLowerCase() !== 'listening' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Listening to';
  }

  private fetchExt (str: string) {
    return str.slice(-4);
  }
}