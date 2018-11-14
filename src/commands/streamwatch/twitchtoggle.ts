/**
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications  
 * **Aliases**: `twitchon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {BooleanResolvable} Option True or False
 * @returns {Message} Confirmation the setting was stored
 */

import {oneLine} from 'common-tags';
import {Command, CommandMessage, CommandoClient} from 'discord.js-commando';
import {deleteCommandMessages, startTyping, stopTyping, validateBool} from '../../components/util.js';

export default class TwitchToggleCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'twitchtoggle',
      memberName: 'twitchtoggle',
      group: 'streamwatch',
      aliases: ['twitchon', 'twitchoff'],
      description: 'Configures whether Twitch Notifications are enabled',
      details: 'This is a killswitch for the entire module!',
      format: 'BooleanResolvable',
      examples: ['twitchtoggle enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable twitch monitoring?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
        }
      ],
      userPermissions: ['ADMINISTRATOR'],
    });
  }

  public run (msg: CommandMessage, {option}: {option: boolean}) {
    startTyping(msg);
    msg.guild.settings.set('twitchnotifiers', option);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`Twitch Notifiers have been
    ${option
    ? `enabled.
        Please make sure to set the output channel with \`${msg.guild.commandPrefix}twitchoutput\`
        and configure which users to monitor with \`${msg.guild.commandPrefix}twitchmonitors\` `
    : 'disabled.'}.`);
  }
}