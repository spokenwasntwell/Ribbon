/**
 * @file Pokémon AbilityCommand - Gets information on an ability in Pokémon  
 * **Aliases**: `abilities`, `abi`
 * @module
 * @category pokémon
 * @name ability
 * @example ability multiscale
 * @param {StringResolvable} AbilityName The name of the ability you  want to find
 * @returns {MessageEmbed} Description and external links for the ability
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Fuse from 'fuse.js';
import * as moment from 'moment';
import { capitalizeFirstLetter, deleteCommandMessages, startTyping, stopTyping } from '../../components/util';
import { BattleAbilities } from '../../data/dex/abilities';
import { AbilityAliases } from '../../data/dex/aliases';

export default class AbilityCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'ability',
      aliases: [ 'abilities', 'abi' ],
      group: 'pokemon',
      memberName: 'ability',
      description: 'Get the info on a Pokémon ability',
      format: 'AbilityName',
      examples: [ 'ability Multiscale' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'ability',
          prompt: 'Get info on which ability?',
          type: 'string',
          parse: (p: string) => p.toLowerCase(),
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { ability }: {ability: string}) {
    try {
      startTyping(msg);
      const fsoptions: Fuse.FuseOptions<any> = {
          shouldSort: true,
          keys: [
            {name: 'alias', getfn: t => t.alias, weight: 0.5},
            {name: 'ability', getfn: t => t.ability, weight: 1},
            {name: 'id', getfn: t => t.id, weight: 0.6},
            {name: 'name', getfn: t => t.name, weight: 1}
          ],
          location: 0,
          distance: 100,
          threshold: 0.6,
          maxPatternLength: 32,
          minMatchCharLength: 1,
        };
      const aliasFuse = new Fuse(AbilityAliases, fsoptions);
      const abilityFuse = new Fuse(BattleAbilities, fsoptions);
      const aliasSearch = aliasFuse.search(ability);
      const abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability);
      const abilityEmbed = new MessageEmbed();

      abilityEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .addField('Description', abilitySearch[0].desc ? abilitySearch[0].desc : abilitySearch[0].shortDesc)
        .addField('External Resource', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(abilitySearch[0].name.replace(/ /g, '_'))}_(Ability\\))
			|  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilitySearch[0].name.toLowerCase().replace(/ /g, '_')})
			|  [PokémonDB](http://pokemondb.net/ability/${abilitySearch[0].name.toLowerCase().replace(/ /g, '-')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(abilitySearch[0].name)}**`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'desc' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no ability found for \`${ability}\``);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`ability\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${ability}
      **Error Message:** ${err}
      `);

      return msg.reply(stripIndents`no ability found for \`${ability}\`. Be sure it is an ability that has an effect in battles!
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
}