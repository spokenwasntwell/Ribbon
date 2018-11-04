/**
 * @file Info ServerInfoCommand - Gets information about the current server  
 * **Aliases**: `serverinfo`, `sinfo`
 * @module
 * @category info
 * @name server
 * @returns {MessageEmbed} Info about the server
 */

import moment from 'moment';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'server',
      memberName: 'server',
      group: 'info',
      aliases: ['serverinfo', 'sinfo'],
      description: 'Gets information about the server.',
      examples: ['server'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  contentFilter (filter) {
    switch (filter) {
    case 0:
      return 'Content filter disabled';
    case 1:
      return 'Scan messages of members without a role';
    case 2:
      return 'Scan messages sent by all members';
    default:
      return 'Content Filter unknown';
    }
  }

  verificationFilter (filter) {
    switch (filter) {
    case 0:
      return 'None - unrestricted';
    case 1:
      return 'Low - must have verified email on account';
    case 2:
      return 'Medium - must be registered on Discord for longer than 5 minutes';
    case 3:
      return 'High - 	(╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes';
    case 4:
      return 'Very High - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number';
    default:
      return 'Verification Filter unknown';
    }
  }

  run (msg) {
    startTyping(msg);
    const channels = msg.guild.channels.map(ty => ty.type),
      presences = msg.guild.presences.map(st => st.status),
      selfRoles = msg.guild.settings.get('selfroles', null),
      serverEmbed = new MessageEmbed();

    let guildChannels = 0,
      onlineMembers = 0;

    for (const i in presences) {
      if (presences[i] !== 'offline') {
        onlineMembers += 1;
      }
    }
    for (const i in channels) {
      if (channels[i] === 'text') {
        guildChannels += 1;
      }
    }

    serverEmbed
      .setColor(msg.guild.owner ? msg.guild.owner.displayHexColor : '#7CFC00')
      .setAuthor('Server Info', 'https://favna.xyz/images/ribbonhost/discordlogo.png')
      .setThumbnail(msg.guild.iconURL({format: 'png'}))
      .setFooter(`Server ID: ${msg.guild.id}`)
      .addField('Server Name', msg.guild.name, true)
      .addField('Owner', msg.guild.owner ? msg.guild.owner.user.tag : 'Owner is MIA', true)
      .addField('Members', msg.guild.memberCount, true)
      .addField('Currently Online', onlineMembers, true)
      .addField('Region', msg.guild.region, true)
      .addField('Highest Role', msg.guild.roles.sort((a, b) => a.position - b.position || a.id - b.id).last().name, true)
      .addField('Number of emojis', msg.guild.emojis.size, true)
      .addField('Number of roles', msg.guild.roles.size, true)
      .addField('Number of channels', guildChannels, true)
      .addField('Created At', moment(msg.guild.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
      .addField('Verification Level', this.verificationFilter(msg.guild.verificationLevel), false)
      .addField('Explicit Content Filter', this.contentFilter(msg.guild.explicitContentFilter), false);

    if (selfRoles) {
      const roleNames = [];

      selfRoles.forEach(r => roleNames.push(msg.guild.roles.get(r).name));

      serverEmbed.addField('Self-Assignable Roles', `${roleNames.map(val => `\`${val}\``).join(', ')}`, false);
    }

    msg.guild.splashURL() !== null ? serverEmbed.setImage(msg.guild.splashURL()) : null;

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(serverEmbed);
  }
};