/**
 * @file Info InviteCommand - Gets the invite link for the bot  
 * **Aliases**: `inv`, `links`, `shill`
 * @module
 * @category info
 * @name invite
 * @returns {MessageEmbed} Invite link along with other links
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class InviteCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'invite',
      aliases: [ 'inv', 'links', 'shill' ],
      group: 'info',
      memberName: 'invite',
      description: 'Gives you invitation links',
      examples: [ 'invite' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public run (msg: CommandoMessage) {
    startTyping(msg);
    const inviteEmbed = new MessageEmbed();

    inviteEmbed
      .setTitle('Ribbon by Favna')
      .setThumbnail('https://favna.xyz/images/appIcons/ribbon.png')
      .setURL('https://favna.xyz/ribbon')
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setDescription(stripIndents`Enrich your Discord server with a fully modular Discord bot with many many commands\n
        [Add me to your server](https://favna.xyz/redirect/ribbon)
        [Join the Support Server](https://favna.xyz/redirect/server)
        [Website](https://favna.xyz/ribbon)
        [GitHub](https://github.com/Favna/Ribbon)
        [Wiki](https://github.com/Favna/Ribbon/wiki)
        `);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(inviteEmbed, 'Find information on Ribbon here: https://favna.xyz/ribbon');
  }
}