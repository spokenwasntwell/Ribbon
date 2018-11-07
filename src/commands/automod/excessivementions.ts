/**
 * @file Automod ExcessiveMentionsCommand - Toggle the excessive mentions filter  
 * **Aliases**: `emf`, `mfilter`,  `spammedmentions`, `manymentions`
 * @module
 * @category automod
 * @name excessivementions
 * @example excessivementions enable
 * @example emf enable 3
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Excessive Emojis filter confirmation log
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components/util';

export default class ExcessiveMentionsCommand extends Command {
  constructor (client : CommandoClient) {
    super(client, {
      name: 'excessivementions',
      memberName: 'excessivementions',
      group: 'automod',
      aliases: [ 'emf', 'mfilter', 'spammedmentions', 'manymentions' ],
      description: 'Toggle the excessive mentions filter',
      format: 'BooleanResolvable',
      examples: [ 'excessivementions enable', 'emf enable 3' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable the Excessive Emojis filter?',
          type: 'boolean',
          validate: (bool : boolean) => validateBool(bool),
        },
        {
          key: 'threshold',
          prompt: 'How many mentions are allowed in 1 message?',
          type: 'integer',
          default: 5,
        }
      ],
      clientPermissions: [ 'MANAGE_MESSAGES' ],
      userPermissions: [ 'MANAGE_MESSAGES' ],
    });
  }

  run (msg : CommandMessage, { option, threshold }) {
    startTyping(msg);

    const emEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        threshold,
      };

    msg.guild.settings.set('mentions', options);

    emEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Mentions filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Threshold:** Messages that have at least ${threshold} mentions will be deleted` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, emEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(emEmbed);
  }
}