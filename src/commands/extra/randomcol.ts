/**
 * @file Extra RandomColCommand - Generates a random color  
 * Providing a color hex will display that color, providing none will generate a random one  
 * **Aliases**: `randhex`, `rhex`, `randomcolor`, `randcol`, `randomhex`
 * @module
 * @category extra
 * @name randomcol
 * @example randomcol  
 * -OR-  
 * randomcol #990000  
 * -OR-  
 * randomcol 36B56e
 * @param {StringResolvable} [hex] Optional: Color hex to display
 * @returns {MessageEmbed} Color of embed matches generated color
 */

import Jimp = require('jimp');
import { Command, CommandoClient, CommandMessage } from 'discord.js-commando'; 
import { MessageEmbed, MessageAttachment } from 'discord.js'; 
import { deleteCommandMessages, stopTyping, startTyping } from '../../components/util';
import { stripIndents } from 'common-tags';

export default class RandomColCommand extends Command {
  constructor (client : CommandoClient) {
    super(client, {
      name: 'randomcol',
      memberName: 'randomcol',
      group: 'extra',
      aliases: [ 'randhex', 'rhex', 'randomcolor', 'randcol', 'randomhex' ],
      description: 'Generate a random color',
      format: '[hex color]',
      examples: [ 'randomcol', 'randomcol #990000', 'randomcol 36B56e' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'col',
          prompt: 'What color do you want to preview?',
          type: 'string',
          default: 'random',
          validate: (col : string) => {
            if ((/^#{0,1}(?:[0-9a-fA-F]{6})$/i).test(col) || col === 'random') {
              return true;
            }

            return 'Respond with a hex formatted color of 6 characters, example: `#990000` or `36B56e`';
          },
          parse: (col : string) => {
            if ((/^#{0}(?:[0-9a-fA-F]{6})$/i).test(col)) {
              return `#${col}`;
            }

            return col;
          },
        }
      ],
    });
  }

  hextodec (color : string) {
    return parseInt(color.replace('#', ''), 16);
  }

  hextorgb (color : string) {
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i).exec(color);

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  async run (msg : CommandMessage, { col }) {
    startTyping(msg);
    const embed = new MessageEmbed();
    const hex = col !== 'random' ? col : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const canvas = await Jimp.read(80, 50, this.hextodec(hex.replace('#', '0x').concat('FF')));
    const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'canvas.png');

    embed
      .attachFiles([ embedAttachment ])
      .setColor(hex)
      .setThumbnail('attachment://canvas.png')
      .setDescription(stripIndents`**hex**: ${hex}
        **dec**: ${this.hextodec(hex)}
        **rgb**: rgb(${this.hextorgb(hex).r}, ${this.hextorgb(hex).g}, ${this.hextorgb(hex).b})`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
}