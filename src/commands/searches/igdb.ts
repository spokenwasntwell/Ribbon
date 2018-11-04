/**
 * @file Searches IGDBCommand - Gets information about a game using Internet Game Database (IGDB)  
 * **Aliases**: `game`, `moby`, `games`
 * @module
 * @category searches
 * @name igdb
 * @example igdb Tales of Berseria
 * @param {StringResolvable} GameName The name of any game that you want to find
 * @returns {MessageEmbed} Information about the fetched game
 */

import igdb from 'igdb-api-node';
import moment from 'moment';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, roundNumber, stopTyping, startTyping} from '../../components/util.js';

module.exports = class IGDBCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'igdb',
      memberName: 'igdb',
      group: 'searches',
      aliases: ['game', 'moby', 'games'],
      description: 'Gets information about a game using Internet Game Database (IGDB)',
      format: 'GameName',
      examples: ['igdb Tales of Berseria'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'game',
          prompt: 'Which game do you want to look up on IGDB?',
          type: 'string'
        }
      ]
    });
  }

  extractNames (arr) {
    let res = '';

    for (let i = 0; i < arr.length; ++i) {
      if (i !== arr.length - 1) {
        res += `${arr[i].name}, `;
      } else {
        res += `${arr[i].name}`;
      }
    }

    return res;
  }

  async run (msg, {game}) {
    startTyping(msg);
    try {

      const gameEmbed = new MessageEmbed(),
        igdbApp = igdb(process.env.igdbkey),
        gameInfo = await igdbApp.games({
          search: game,
          fields: ['name', 'url', 'summary', 'rating', 'developers', 'genres', 'release_dates', 'platforms', 'cover', 'esrb', 'pegi'],
          limit: 1,
          offset: 0
        }),
        coverImg = await gameInfo.body[0].cover.url.includes('http') ? gameInfo.body[0].cover.url : `https:${gameInfo.body[0].cover.url}`,
        developerInfo = await igdbApp.companies({
          ids: gameInfo.body[0].developers,
          fields: ['name']
        }),
        genreInfo = await igdbApp.genres({
          ids: gameInfo.body[0].genres,
          fields: ['name']
        }),
        platformInfo = await igdbApp.platforms({
          ids: gameInfo.body[0].platforms,
          fields: ['name']
        }),
        releaseDate = moment(gameInfo.body[0].release_dates[0].date).format('MMMM Do YYYY');

      gameEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(gameInfo.body[0].name)
        .setURL(gameInfo.body[0].url)
        .setThumbnail(coverImg)
        .addField('User Score', roundNumber(gameInfo.body[0].rating, 1), true)
        .addField(`${gameInfo.body[0].pegi ? 'PEGI' : 'ESRB'} rating`, gameInfo.body[0].pegi ? gameInfo.body[0].pegi.rating : gameInfo.body[0].esrb.rating, true)
        .addField('Release Date', releaseDate, true)
        .addField('Genres', this.extractNames(genreInfo.body), true)
        .addField('Developer', developerInfo.body[0].name, true)
        .addField('Platforms', this.extractNames(platformInfo.body), true)
        .setDescription(gameInfo.body[0].summary);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(gameEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${game}\``);
    }
  }
};