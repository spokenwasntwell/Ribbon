/**
 * @file Owner CheckGuildsCommand - Lists all guilds Ribbon is in  
 * @module
 * @category owner
 * @name checkguilds 
 * @returns {Message} Amount and list of guilds in code blocks
 */

import { stripIndents } from 'common-tags';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class CheckGuildsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'checkguilds',
      group: 'owner',
      memberName: 'checkguilds',
      description: 'Check the current guild count and their names',
      guildOnly: false,
      ownerOnly: true,
    });
  }

  public run (msg: CommandoMessage) {
    return msg.say(stripIndents`\`\`\`The current guild count: ${this.client.guilds.size}

        Guild list:
        ${this.client.guilds.map(m => m.name).join('\n')}\`\`\``, { split: true });
  }
}