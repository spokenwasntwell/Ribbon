/**
 * @file Weeb FeedCommand - Feed someone licious food 🍜 😋!  
 * @module
 * @category weeb
 * @name feed
 * @example feed Ren
 * @param {GuildMemberResolvable} [MemberToFeed] Name of the member you want to feed
 * @returns {MessageEmbed} Feeding and a cute image 🍜 😋
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class FeedCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'feed',
      memberName: 'feed',
      group: 'weeb',
      description: 'Feed someone licious food 🍜 😋!',
      format: 'MemberToFeed',
      examples: ['feed Ren'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to feed?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const feedFetch = await fetch('https://nekos.life/api/v2/img/feed'),
        feedImg = await feedFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You were fed by ${msg.member.displayName} 🍜 😋!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? feedImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a feed image 💔');
    }
  }

};