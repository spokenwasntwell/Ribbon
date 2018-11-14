/**
 * @file Streamwatch TwitchMonitorsCommand - Configure which streamers to monitor  
 * **Aliases**: `monitors`, `monitor`, `twitchmonitor`
 * @module
 * @category streamwatch
 * @name twitchmonitors
 * @example twitchmonitors techagent favna
 * @param {StringResolvable} AnyMembers List of members to monitor space delimited
 * @returns {Message} Confirmation the setting was stored
 */

import {stripIndents} from 'common-tags';
import { GuildMember } from 'discord.js';
import {Command, CommandMessage, CommandoClient} from 'discord.js-commando';
import {deleteCommandMessages, startTyping, stopTyping} from '../../components/util.js';

export default class TwitchMonitorsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'twitchmonitors',
      memberName: 'twitchmonitors',
      group: 'streamwatch',
      aliases: ['monitors', 'monitor', 'twitchmonitor'],
      description: 'Configures which streamers to spy on',
      format: 'Member [Member Member Member]',
      examples: ['twitchmonitors Favna Techagent'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'members',
          prompt: 'Which members to monitor?',
          type: 'member',
          infinite: true,
        }
      ],
      userPermissions: ['ADMINISTRATOR'],
    });
  }

  public run (msg: CommandMessage, {members}: {members: Array<GuildMember>}) {
    startTyping(msg);
    const memberIDs = members.map(m => m.id);
    const memberNames = members.map(m => m.displayName);

    msg.guild.settings.set('twitchmonitors', memberIDs);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(stripIndents`🕵 Started spying on the stream status of ${memberNames.map(val => `\`${val}\``).join(', ')}
        Use \`${msg.guild.commandPrefix}twitchtoggle\` to toggle twitch notifiers on or off
        Use \`${msg.guild.commandPrefix}twitchoutput\` to set the channel the notifiers should be sent to`);
  }
}