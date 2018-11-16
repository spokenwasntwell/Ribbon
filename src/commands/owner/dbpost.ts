/**
 * @file Owner DBPostCommand - Posts current guild count to discordbotlist  
 * @module
 * @category owner
 * @name dbpost
 * @returns {Message} Confirmation the update was made
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class DBPostCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'dbpost',
      group: 'owner',
      memberName: 'dbpost',
      description: 'Post current server count to Discord Bots List',
      guildOnly: false,
      ownerOnly: true,
    });
  }

  public async run (msg: CommandoMessage) {
    try {
      startTyping(msg);

      await fetch(`https://discordbots.org/api/bots/${this.client.user.id}/stats`, {
        body: JSON.stringify({ server_count: this.client.guilds.size }),
        headers: {
          Authorization: process.env.DISCORD_BOTS_API_KEY,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('updated discordbots.org stats.');
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred updating discordbots.org stats.');
    }
  }
}