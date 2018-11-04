/**
 * @file Pokémon DexCommand - Gets information about a Pokémon from Dexter  
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example `necrozmaduskmane` or `metagrossmega`  
 * If you want to get the shiny sprite displayed add the `--shiny` at the end of the search  
 * **Aliases**: `p`, `mon`, `pokemon`, `pokedex`, `df`, `dexfind`, `dexdata`, `dexter`, `rotom`
 * @module
 * @category pokemon
 * @name dex
 * @example dex dragonite
 * @param {StringResolvable} PokemonName The name of the pokemon you want to find
 * @returns {MessageEmbed} Lots of information about the pokemon
 */

import Fuse from 'fuse.js';
import dexEntries from '../../data/dex/flavorText.json';
import moment from 'moment';
import smogonFormats from '../../data/dex/formats.json';
import zalgo from 'to-zalgo';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {PokeAliases} from '../../data/dex/aliases';
import {BattlePokedex} from '../../data/dex/pokedex';
import {oneLine, stripIndents} from 'common-tags';
import {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DexCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dex',
      memberName: 'dex',
      group: 'pokemon',
      aliases: ['p', 'mon', 'pokemon', 'pokedex', 'df', 'dexfind', 'dexdata', 'dexter', 'rotom'],
      description: 'Get the info on a Pokémon',
      format: 'PokemonName',
      examples: ['dex Dragonite'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'pokemon',
          prompt: 'Get info from which Pokémon?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  fetchColor (col) {
    switch (col) {
    case 'Black':
      return '#323232';
    case 'Blue':
      return '#257CFF';
    case 'Brown':
      return '#A3501A';
    case 'Gray':
      return '#969696';
    case 'Green':
      return '#3EFF4E';
    case 'Pink':
      return '#FF65A5';
    case 'Purple':
      return '#A63DE8';
    case 'Red':
      return '#FF3232';
    case 'White':
      return '#E1E1E1';
    case 'Yellow':
      return '#FFF359';
    default:
      return '#FF0000';
    }
  }

  /* eslint-disable max-statements, complexity */
  run (msg, {pokemon, shines}) {
    try {
      startTyping(msg);
      if ((/(?:--shiny)/i).test(pokemon)) {
        pokemon = (pokemon.substring(0, pokemon.indexOf('--shiny')) + pokemon.substring(pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
        shines = true;
      }
      if (pokemon.split(' ')[0] === 'mega') {
        pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
      }

      const aliasoptions = {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['alias']
        },
        pokeoptions = {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['num', 'species']
        },
        aliasFuse = new Fuse(PokeAliases, aliasoptions),
        pokeFuse = new Fuse(BattlePokedex, pokeoptions),
        firstSearch = pokeFuse.search(pokemon),
        aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : null,
        pokeSearch = !firstSearch.length && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch,
        dexEmbed = new MessageEmbed(),
        poke = pokeSearch[0],
        pokeData = {
          abilities: '',
          evos: `**${capitalizeFirstLetter(poke.species)}**`,
          flavors: '*PokéDex data not found for this Pokémon*',
          genders: '',
          sprite: '',
          tier: smogonFormats.find(s => s.name === poke.species.toLowerCase().replace(/(-|%| )/gm, '')).tier
        };

      if (poke.prevo) {
        pokeData.evos = oneLine`\`${capitalizeFirstLetter(poke.prevo)}\` ${pokeFuse.search(poke.prevo)[0].evoLevel ? `(${pokeFuse.search(poke.prevo)[0].evoLevel})` : ''}
        → ${pokeData.evos} **(${poke.evoLevel})**`;

        if (pokeFuse.search(poke.prevo).length && pokeFuse.search(poke.prevo)[0].prevo) {
          pokeData.evos = `\`${capitalizeFirstLetter(pokeFuse.search(poke.prevo)[0].prevo)}\` → ${pokeData.evos}`;
        }
      }

      if (poke.evos) {
        pokeData.evos = oneLine`${pokeData.evos} → ${poke.evos.map(entry => `\`${capitalizeFirstLetter(entry)}\` (${pokeFuse.search(entry)[0].evoLevel})`).join(', ')} `;

        if (poke.evos.length === 1) {
          if (pokeFuse.search(poke.evos[0]).length && pokeFuse.search(poke.evos[0])[0].evos) {
            pokeData.evos = oneLine`${pokeData.evos}
            → ${pokeFuse.search(poke.evos[0])[0].evos.map(entry => `\`${capitalizeFirstLetter(entry)}\` (${pokeFuse.search(entry)[0].evoLevel})`).join(', ')}`;
          }
        }
      }

      if (!poke.prevo && !poke.evos) {
        pokeData.evos += ' (No Evolutions)';
      }

      for (const ability in poke.abilities) {
        if (ability === '0') {
          pokeData.abilities += `${poke.abilities[ability]}`;
        } else if (ability === 'H') {
          pokeData.abilities += `, *${poke.abilities[ability]}*`;
        } else {
          pokeData.abilities += `, ${poke.abilities[ability]}`;
        }
      }

      switch (poke.gender) {
      case 'N':
        pokeData.genders = 'None';
        break;
      case 'M':
        pokeData.genders = '100% ♂';
        break;
      case 'F':
        pokeData.genders = '100% ♀';
        break;
      default:
        pokeData.genders = '50% ♂ | 50% ♀';
        break;
      }

      if (poke.genderRatio) {
        pokeData.genders = `${poke.genderRatio.M * 100}% ♂ | ${poke.genderRatio.F * 100}% ♀`;
      }

      if (poke.num >= 0) {
        if (poke.forme && dexEntries[`${poke.num}${poke.forme.toLowerCase()}`]) {
          pokeData.flavors = dexEntries[`${poke.num}${poke.forme.toLowerCase()}`][dexEntries[`${poke.num}${poke.forme.toLowerCase()}`].length - 1].flavor_text;
        } else {
          pokeData.flavors = dexEntries[poke.num][dexEntries[poke.num].length - 1].flavor_text;
        }
      }

      if (poke.num < 0) {
        pokeData.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (shines) {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${poke.species.replace(/(%| )/g, '').toLowerCase()}.png`;
      } else {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${poke.species.replace(/(%| )/g, '').toLowerCase()}.png`;
      }

      dexEmbed
        .setColor(this.fetchColor(poke.color))
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .setAuthor(`#${poke.num} - ${capitalizeFirstLetter(poke.species)}`, pokeData.sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase().replace(/(%| )/g, '')}.gif`)
        .addField('Type(s)', poke.types.join(', '), true)
        .addField('Abilities', pokeData.abilities, true)
        .addField('Gender Ratio', pokeData.genders, true)
        .addField('Smogon Tier', pokeData.tier ? pokeData.tier : 'Unknown/Alt form', true)
        .addField('Height', `${poke.heightm}m`, true)
        .addField('Weight', `${poke.weightkg}kg`, true)
        .addField('Egg Groups', poke.eggGroups.join(', '), true);
      poke.otherFormes ? dexEmbed.addField('Other Formes', poke.otherFormes.join(', '), true) : null;
      dexEmbed
        .addField('Evolutionary Line', pokeData.evos, false)
        .addField('Base Stats', Object.keys(poke.baseStats).map(index => `${index.toUpperCase()}: **${poke.baseStats[index]}**`)
          .join(', '))
        .addField('PokéDex Data', pokeData.flavors)
        .addField('External Resource', oneLine`${poke.num >= 0 ? `
    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(poke.species).replace(/ /g, '_')}_(Pokémon\\))`
          : '*Fan made Pokémon*'}
      ${poke.num >= 1 ? `  |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${poke.species.replace(/ /g, '_')})  
      |  [PokémonDB](http://pokemondb.net/pokedex/${poke.species.replace(/ /g, '-')})` : ''}`);

      if (poke.num === 0) {
        const fields = [];

        for (const field in dexEmbed.fields) {
          fields.push({
            name: zalgo(dexEmbed.fields[field].name),
            value: zalgo(dexEmbed.fields[field].value),
            inline: dexEmbed.fields[field].inline
          });
        }

        dexEmbed.fields = fields;
        dexEmbed.author.name = zalgo(dexEmbed.author.name);
        dexEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(dexEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'species' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no Pokémon found for \`${pokemon}\``);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`dex\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${pokemon}
      **Shiny?:** ${shines ? 'yes' : 'no'}
      **Error Message:** ${err}
      `);

      return msg.reply(stripIndents`no Pokémon found for \`${pokemon}\`.
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
};