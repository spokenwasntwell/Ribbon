/**
 * @file Searches SteamCommand - Gets information about a game using Steam  
 * **Aliases**: `valve`
 * @module
 * @category searches
 * @name steam
 * @example steam Tales of Berseria
 * @param {StringResolvable} GameName The name of any game that you want to find
 * @returns {MessageEmbed} Information about the fetched game
 */

import SteamAPI from 'steamapi';
import cheerio from 'cheerio';
import currencySymbol from 'currency-symbol-map';
import fetch from 'node-fetch';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class SteamCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'steam',
      memberName: 'steam',
      group: 'searches',
      aliases: ['valve'],
      description: 'Finds a game on Steam',
      format: 'GameName',
      examples: ['steam Tales of Berseria'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'game',
          prompt: 'Which game do you want to find on the steam store?',
          type: 'string'
        }
      ]
    });
  }

  insert (str, value) {
    return str.substring(0, str.length - 2) + value + str.substring(str.length - 2);
  }

  async run (msg, {game}) {
    try {
      startTyping(msg);

      const steam = new SteamAPI(process.env.steamkey),
        steamEmbed = new MessageEmbed(),
        steamSearch = await fetch(`http://store.steampowered.com/search/?${querystring.stringify({
          term: game,
          category1: 998
        })}`),
        $ = cheerio.load(await steamSearch.text()),
        gameID = $('#search_result_container > div:nth-child(2) > a:nth-child(2)').attr('href')
          .split('/')[4],
        steamData = await steam.getGameDetails(gameID),
        genres = [],
        platforms = [];

      steamData.platforms.windows ? platforms.push('Windows') : null;
      steamData.platforms.mac ? platforms.push('MacOS') : null;
      steamData.platforms.linux ? platforms.push('Linux') : null;

      for (const index in steamData.genres) {
        genres.push(steamData.genres[index].description);
      }

      steamEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(steamData.name)
        .setURL(`http://store.steampowered.com/app/${steamData.steam_appid}/`)
        .setImage(steamData.header_image)
        .setDescription(cheerio.load(steamData.short_description).text())
        .addField(steamData.price_overview
          ? `Price in ${steamData.price_overview.currency}`
          : 'Price',
        steamData.price_overview
          ? `${currencySymbol(steamData.price_overview.currency)}${this.insert(steamData.price_overview.final.toString(), ',')}`
          : 'Free',
        true)
        .addField('Release Date', steamData.release_date.date, true)
        .addField('Platforms', platforms.join(', '), true)
        .addField('Controller Support', steamData.controller_support ? steamData.controller_support : 'None', true)
        .addField('Age requirement', steamData.required_age !== 0 ? steamData.required_age : 'Everyone / Not in API', true)
        .addField('Genres', genres.join(', '), true)
        .addField('Developer(s)', steamData.developers, true)
        .addField('Publisher(s)', steamData.publishers, true)
        .addField('Steam Store Link', `http://store.steampowered.com/app/${steamData.steam_appid}/`, false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(steamEmbed, `http://store.steampowered.com/app/${steamData.steam_appid}/`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${game}\``);
    }
  }
};