/**
 * @file Games RockPaperScissorCommand - Play Rock Paper Scissors against random.org randomization  
 * **Aliases**: `rockpaperscissors`
 * @module
 * @category games
 * @name rps
 * @example rps Rock
 * @param {StringResolvable} HandToPlay The hand that you want to play
 * @returns {MessageEmbed} Result of the conflict
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class RockPaperScissorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rps',
      memberName: 'rps',
      group: 'games',
      aliases: ['rockpaperscissors'],
      description: 'Play Rock Paper Scissors against random.org randomization',
      format: 'HandToPlay',
      examples: ['rps Rock'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'hand',
          prompt: 'Do you play rock, paper or scissors?',
          type: 'string',
          validate: v => (/(rock|paper|scissors)/i).test(v) ? true : 'has to be one of `rock`, `paper` or `scissors`',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  // eslint-disable-next-line complexity
  async run (msg, {hand}) {
    try {
      startTyping(msg);

      const randPost = await fetch('https://api.random.org/json-rpc/1/invoke', {
          method: 'POST',
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'generateIntegers',
            params: {
              apiKey: process.env.randomkey,
              n: 1,
              min: 1,
              max: 3
            },
            id: Math.floor(Math.random() * 42)
          }),
          headers: {'Content-Type': 'application/json-rpc'}
        }),
        random = await randPost.json(),
        randoms = random.result.random.data[0],
        rpsEmbed = new MessageEmbed();

      let resString = 'Woops something went wrong';

      if (hand === 'rock' && randoms === 1) {
        resString = 'It\'s a draw 😶! Both picked 🗿';
      } else if (hand === 'rock' && randoms === 2) {
        resString = 'I won 😃! My 📜 covered your 🗿';
      } else if (hand === 'rock' && randoms === 3) {
        resString = ' I lost 😞! Your 🗿 smashed my ️️️✂️ to pieces';
      } else if (hand === 'paper' && randoms === 1) {
        resString = 'I lost 😞! Your 📜 covered my 🗿';
      } else if (hand === 'paper' && randoms === 2) {
        resString = 'It\'s a draw 😶! Both picked 📜';
      } else if (hand === 'paper' && randoms === 3) {
        resString = 'I won 😃! My ✂️ cut your 📜 to shreds';
      } else if (hand === 'scissor' && randoms === 1) {
        resString = 'I won 😃! My 🗿 smashed your ✂️ to pieces';
      } else if (hand === 'scissor' && randoms === 2) {
        resString = 'I lost 😞! Your ✂️ cut my 📜 to shreds';
      } else if (hand === 'scissor' && randoms === 3) {
        resString = 'It\'s a draw 😶! Both picked ✂️';
      }

      rpsEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle('Rock Paper Scissors')
        .setDescription(resString);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(rpsEmbed);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('an error occurred getting a random result and I\'m not going to rig this game.');
    }
  }
};