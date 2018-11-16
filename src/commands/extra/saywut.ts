/**
 * @file Extra SayWutCommand - Bust the last "say" user  
 * **Aliases**: `saywat`, `saywot`
 * @module
 * @category extra
 * @name saywut
 * @returns {MessageEmbed} Info on who used the "say" command last
 */

import { oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class SayWutCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'saywut',
      aliases: [ 'saywat', 'saywot' ],
      group: 'extra',
      memberName: 'saywut',
      description: 'Bust the last "say" user',
      examples: [ 'saywut' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public run (msg: CommandoMessage) {
    startTyping(msg);
    const saydata = msg.guild.settings.get('saydata', null);
    const wutEmbed = new MessageEmbed();

    if (saydata) {
      wutEmbed
        .setColor(saydata.memberHexColor)
        .setTitle(`Last ${saydata.commandPrefix}say message author`)
        .setAuthor(oneLine`${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
        .setDescription(saydata.argString)
        .setTimestamp(moment(saydata.messageDate).toDate());

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(wutEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`);
  }
}