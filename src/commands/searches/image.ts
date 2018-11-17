/**
 * @file Searches ImageCommand - Gets an image through Google Images  
 * **Aliases**: `img`, `i`
 * @module
 * @category searches
 * @name image
 * @example image Pyrrha Nikos'
 * @param {StringResolvable} ImageQuery Image to find on Google Images
 * @returns {MessageEmbed} Embedded image and search query
 */

import * as cheerio from 'cheerio';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { stringify } from '../../components/querystring';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class ImageCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'image',
      aliases: [ 'img', 'i' ],
      group: 'searches',
      memberName: 'image',
      description: 'Finds an image through Google',
      format: 'ImageQuery',
      examples: [ 'image Pyrrha Nikos' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'query',
          prompt: 'What do you want to find images of?',
          type: 'string',
          parse: (p: string) => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
            .split(' ')
            .map(x => encodeURIComponent(x))
            .join('+'),
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { query }: {query: string}) {
    const embed = new MessageEmbed();
    const nsfwAllowed = msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;

    try {
      startTyping(msg);
      const imageSearch = await fetch(`https://www.googleapis.com/customsearch/v1?${stringify({
          cx: process.env.IMAGE_KEY,
          key: process.env.GOOGLE_API_KEY,
          q: query,
          safe: nsfwAllowed ? 'off' : 'medium',
          searchType: 'image',
        })}`);
      const imageData = await imageSearch.json();

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(imageData.items[0].link)
        .setFooter(`Search query: "${query.replace(/\+/g, ' ')}"`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);

    } catch (err) {
      // Intentionally empty
    }

    try {
      const backupSearch = await fetch(`https://www.google.com/search?${stringify({
          gs_l: 'img',
          q: query,
          safe: nsfwAllowed ? 'off' : 'medium',
          tbm: 'isch',
        })}`);
      const $ = cheerio.load(await backupSearch.text());
      const src = $('.images_table').find('img').first().attr('src');

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(src)
        .setFooter(`Search query: "${query}"`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${msg.argString}\``);
    }
  }
}