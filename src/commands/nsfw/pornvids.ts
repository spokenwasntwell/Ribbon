/**
 * @file nsfw PornVidsCommand - Gets a NSFW video from pornhub  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `porn`, `nsfwvids`
 * @module
 * @category nsfw
 * @name pornvids
 * @example pornvids babe
 * @param {StringResolvable} Query Something you want to find
 * @returns {MessageEmbed} URL, duration and embedded thumbnail
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class PornVidsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'pornvids',
      memberName: 'pornvids',
      group: 'nsfw',
      aliases: [ 'porn', 'nsfwvids' ],
      description: 'Search porn videos',
      format: 'NSFWToLookUp',
      examples: [ 'pornvids babe' ],
      guildOnly: false,
      nsfw: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'porn',
          prompt: 'What pornography do you want to find?',
          type: 'string',
        }
      ],
    });
  }

  public async run (msg: CommandMessage, { porn }: {porn: string}) {
    try {
      startTyping(msg);

      const pornEmbed = new MessageEmbed();
      const res = await fetch(`https://www.pornhub.com/webmasters/search?${qs.stringify({ search: porn })}`);
      const vid = await res.json();
      const vidRandom = Math.floor(Math.random() * vid.videos.length);

      pornEmbed
        .setURL(vid.videos[vidRandom].url)
        .setTitle(vid.videos[vidRandom].title)
        .setImage(vid.videos[vidRandom].default_thumb)
        .setColor('#FFB6C1')
        .addField('Porn video URL', `[Click Here](${vid.videos[vidRandom].url})`, true)
        .addField('Porn video duration', `${vid.videos[vidRandom].duration} minutes`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pornEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${porn}\``);
    }
  }
}