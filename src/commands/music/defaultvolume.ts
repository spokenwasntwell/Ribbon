/**
 * @file Music DefaultVolumeCommand - Sets the server's default volume  
 * **Aliases**: `defvol`
 * @module
 * @category music
 * @name defaultvolume
 * @example defaultvolume 2
 * @param {number/"show"} VolumeToSet The volume to set or use "show" to show current default volume
 * @returns {Message} Confirmation the setting was stored 
 */

import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DefaultVolumeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'defaultvolume',
      memberName: 'defaultvolume',
      group: 'music',
      aliases: ['defvol'],
      description: 'Shows or sets the default volume level',
      format: 'VolumeToSet',
      examples: ['defaultvolume 2'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'volume',
          prompt: 'What is the default volume I should set? (\'default\' to reset)',
          type: 'string',
          default: 'show'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {volume}) {
    startTyping(msg);
    if (volume === 'show') {
      const defaultVolume = msg.guild.settings.get('defaultVolume', process.env.DEFAULT_VOLUME);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the default volume level is ${defaultVolume}.`);
    }

    if (volume === 'default') {
      msg.guild.settings.remove('defaultVolume');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`set the default volume level to Ribbon's default (currently ${process.env.DEFAULT_VOLUME}).`);
    }

    const defaultVolume = parseInt(volume, 10);

    if (isNaN(defaultVolume) || defaultVolume <= 0 || defaultVolume > 10) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('invalid number provided. It must be in the range of 0-10.');
    }

    msg.guild.settings.set('defaultVolume', defaultVolume);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`set the default volume level to ${defaultVolume}.`);

  }
};