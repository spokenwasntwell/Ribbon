/**
 * @file Weeb CuddleCommand - Cuuuuddlleeesss!! 💕!  
 * @module
 * @category weeb
 * @name cuddle
 * @example cuddle Velvet
 * @param {GuildMemberResolvable} [MemberToCuddle] Name of the member you want to cuddle
 * @returns {MessageEmbed} The cuddle and a cute image 💕
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class CuddleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'cuddle',
      memberName: 'cuddle',
      group: 'weeb',
      description: 'Cuuuuddlleeesss!! 💕!',
      format: '[MemberToCuddle]',
      examples: ['cuddle Velvet'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to cuddle?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const cuddleFetch = await fetch('https://nekos.life/api/v2/img/cuddle'),
        cuddleImg = await cuddleFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `Awww ${msg.member.displayName} is giving ${member.displayName} cuddles 💕!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? cuddleImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a cuddle image 💔');
    }
  }

};