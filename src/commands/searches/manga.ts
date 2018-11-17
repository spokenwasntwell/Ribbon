/**
 * @file Searches MangaCommand - Gets information about any manga from kitsu.io  
 * **Aliases**: `cartoon`, `man`
 * @module
 * @category searches
 * @name manga
 * @example manga Yu-Gi-Oh
 * @param {StringResolvable} AnyManga manga to look up
 * @returns {MessageEmbed} Information about the fetched manga
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import { deleteCommandMessages, removeDiacritics, startTyping, stopTyping } from '../../components/util';

export default class MangaCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'manga',
      aliases: [ 'cartoon', 'man' ],
      group: 'searches',
      memberName: 'manga',
      description: 'Finds manga on kitsu.io',
      format: 'MangaName',
      examples: [ 'manga Pokemon' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'manga',
          prompt: 'What manga do you want to find?',
          type: 'string',
          default: 'pokemon',
          parse: (p: string) => removeDiacritics(p.toLowerCase().replace(/([^a-zA-Z0-9_\- ])/gm, '')),
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { manga }: {manga: string}) {
    try {
      startTyping(msg);
      const mangaList = await fetch(`https://${process.env.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`, {
          body: JSON.stringify({ params: `query=${manga}&facetFilters=[\"kind:manga\"]` }),
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-API-Key': process.env.KITSU_KEY,
            'X-Algolia-Application-Id': process.env.KITSU_ID,
          },
          method: 'POST',
        });
      const mangas = await mangaList.json();
      const hit = mangas.hits[0];
      const mangaEmbed = new MessageEmbed();

      mangaEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(hit.titles.en ? hit.titles.en : hit.canonicalTitle)
        .setURL(`https://kitsu.io/anime/${hit.id}`)
        .setDescription(hit.synopsis.replace(/(.+)(?:\r|\n|\t)(.+)/gim, '$1 $2').split('\r\n')[0])
        .setImage(hit.posterImage.original)
        .setThumbnail('https://favna.xyz/images/ribbonhost/kitsulogo.png')
        .addField('Canonical Title', hit.canonicalTitle, true)
        .addField('Score', `${hit.averageRating}%`, true)
        .addField('Age Rating', hit.ageRating ? hit.ageRating : 'None', true)
        .addField('First Publish Date', moment.unix(hit.startDate).format('MMMM Do YYYY'), true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(mangaEmbed, `https://kitsu.io/manga/${hit.slug}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no manga found for \`${manga}\` `);
    }
  }
}