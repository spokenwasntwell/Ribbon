/**
 * @file Games StrawpollCommand - Create a strawpoll and find out what people really think (hopefully)  
 * Has a very specific syntax! Be sure to adapt the example!  
 * **Aliases**: `straw`, `poll`
 * @module
 * @category games
 * @name strawpoll
 * @example strawpoll 'Best RWBY girl?' 'Pyrrha Nikos' 'Ruby Rose'
 * @example strawpoll 'Best coding language?' JavaScript C# C++
 * @param {StringResolvable} Question The question that the strawpoll needs to answer. Recommended to wrap in `" "` (or `' '`) to allow spaces
 * @param {StringResolvable} Options The options the strawpoll should have. Recommended to wrap in `" "` (or `' '`) to allow spaces. Splits on every \`|\`
 * @returns {MessageEmbed} Poll url, title, options and preview image
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class StrawpollCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'strawpoll',
      aliases: [ 'straw', 'poll' ],
      group: 'games',
      memberName: 'strawpoll',
      description: 'Strawpoll something. Recommended to use the replying with each argument method to allow spaces in the title',
      format: '\'Title Of Strawpoll\' OptionA OptionB OptionC...',
      details: 'Has a very specific syntax! Be sure to adapt the example!',
      examples: [ 'strawpoll \'Best RWBY girl?\' \'Pyrrha Nikos\' \'Ruby Rose\'', 'strawpoll \'Best coding language?\' JavaScript C# C++' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'title',
          prompt: 'Title of the strawpoll',
          type: 'string',
        },
        {
          key: 'options',
          prompt: 'What are the messages for the strawpoll (minimum is 2)? Send 1 option per message and end with `finish`',
          type: 'string',
          infinite: true,
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { title, options }: {title: string, options: string}) {
    if (options.length < 2) {
      return msg.reply('a poll needs to have at least 2 options to pick from');
    }
    try {
      startTyping(msg);
      const pollEmbed = new MessageEmbed();
      const pollPost = await fetch('https://www.strawpoll.me/api/v2/polls', {
        body: JSON.stringify({
          options,
          title,
          captcha: true,
          dupcheck: 'normal',
          multi: false,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        });
      const strawpoll = await pollPost.json();

      pollEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(strawpoll.title)
        .setURL(`http://www.strawpoll.me/${strawpoll.id}`)
        .setImage(`http://www.strawpoll.me/images/poll-results/${strawpoll.id}.png`)
        .setDescription(`Options on this poll: ${strawpoll.options.map((val: string) => `\`${val}\``).join(', ')}`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pollEmbed, `http://www.strawpoll.me/${strawpoll.id}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred creating the strawpoll');
    }
  }
}