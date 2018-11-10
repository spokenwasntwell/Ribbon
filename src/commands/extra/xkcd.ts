/**
 * @file Extra XKCDCommand - Gets a random image from xkcd  
 * **Aliases**: `devjoke`, `comicjoke`
 * @module
 * @category extra
 * @name xkcd
 * @returns {MessageEmbed} Embedded image and info about it
 */

import fetch from 'node-fetch';
import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { deleteCommandMessages, stopTyping, startTyping } from '../../components/util';

export default class XKCDCommand extends Command {
  constructor (client : CommandoClient) {
    super(client, {
      name: 'xkcd',
      memberName: 'xkcd',
      group: 'extra',
      aliases: [ 'devjoke', 'comicjoke' ],
      description: 'Gets a random image from xkcd',
      examples: [ 'xkcd' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  async run (msg : CommandMessage) {
    try {
      startTyping(msg);
      const count = await fetch('https://xkcd.com/info.0.json'),
        totalImages = await count.json(),
        randomNum = Math.floor(Math.random() * totalImages.num) + 1,
        res = await fetch(`https://xkcd.com/${randomNum}/info.0.json`),
        randomImage = await res.json(),
        xkcdEmbed = new MessageEmbed();

      xkcdEmbed
        .setTitle(randomImage.safe_title)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(randomImage.alt)
        .setImage(randomImage.img)
        .setURL(`https://xkcd.com/${randomNum}/`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(xkcdEmbed);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('woops, couldn\'t get a random xkcd image. Have a 🎀 instead!');
    }
  }
}