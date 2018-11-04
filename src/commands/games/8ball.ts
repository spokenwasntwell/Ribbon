/**
 * @file Games EightBallCommand - Rolls a magic 8 ball using your input  
 * **Aliases**: `eightball`
 * @module
 * @category games
 * @name 8ball
 * @example 8ball is Favna a genius coder?
 * @param {StringResolvable} question Question you want the 8 ball to answer
 * @returns {MessageEmbed} Your question and its answer
 */

import predict from 'eightball';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class EightBallCommand extends Command {
  constructor (client) {
    super(client, {
      name: '8ball',
      memberName: '8ball',
      group: 'games',
      aliases: ['eightball'],
      description: 'Roll a magic 8ball',
      format: 'YourQuestion',
      examples: ['8ball is Favna a genius coder?'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'question',
          prompt: 'For what question should I roll a magic 8ball?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {question}) {
    startTyping(msg);
    const eightBallEmbed = new MessageEmbed();

    eightBallEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .addField(':question: Question', question, false)
      .addField(':8ball: 8ball', predict(), false);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(eightBallEmbed);
  }
};