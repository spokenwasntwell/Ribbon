/**
 * @file Weeb SlapCommand - Slap a dumb person 💢!  
 * @module
 * @category weeb
 * @name slap
 * @example slap Cinder
 * @param {GuildMemberResolvable} [MemberToSlap] Name of the member you want to slap
 * @returns {MessageEmbed} The slap and an image
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class SlapCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slap',
      memberName: 'slap',
      group: 'weeb',
      description: 'Slap a dumb person 💢',
      format: 'MemberToSlap',
      examples: ['slap Cinder'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to slap?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const slapFetch = await fetch('https://nekos.life/api/v2/img/slap'),
        slapImg = await slapFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You got slapped by ${msg.member.displayName} 💢!` : `${msg.member.displayName} did you mean to slap someone B-Baka 🤔?`,
        image: {url: member ? slapImg.url : 'http://cdn.awwni.me/mz98.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a slap image 💔');
    }
  }
};