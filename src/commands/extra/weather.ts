/**
 * @file Extra Weather - Get the current weather forecast in any city  
 * Potentially you'll have to specify city if the city is in multiple countries, i.e. `weather amsterdam` will not be the same as `weather amsterdam missouri`  
 * Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city or even as exact as a street.  
 * **Aliases**: `temp`, `forecast`, `fc`, `wth`
 * @module
 * @category extra
 * @name weather
 * @example weather Amsterdam
 * @param {StringResolvable} CityName Name of the city to get the weather forecast for
 * @returns {MessageEmbed} Various statistics about the current forecast
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components/util';

export default class WeatherCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'weather',
      aliases: [ 'temp', 'forecast', 'fc', 'wth' ],
      group: 'extra',
      memberName: 'weather',
      description: 'Get the weather in a city',
      format: 'CityName',
      details: stripIndents`
      Potentially you'll have to specify city if the city is in multiple countries, i.e. \`weather amsterdam\` will not be the same as \`weather amsterdam missouri\`
      Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city or even as exact as a street.`,
      examples: [ 'weather amsterdam' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'location',
          prompt: 'For which location do you want to know the weather forecast?',
          type: 'string',
        }
      ],
    });
  }

  public async getCords (location: string) {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${qs.stringify({
        address: location,
        key: process.env.GOOGLE_API_KEY,
      })}`);
    const cords = await res.json();

    return {
      address: cords.results[0].formatted_address,
      lat: cords.results[0].geometry.location.lat,
      long: cords.results[0].geometry.location.lng,
    };
  }

  public fahrenify (temp: number) {
    return temp * 1.8 + 32;
  }

  public mileify (speed: number) {
    return speed * 0.6214;
  }

  public async run (msg: CommandMessage, { location }) {
    try {
      startTyping(msg);
      const cords = await this.getCords(location);
      const res = await fetch(`https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${cords.lat},${cords.long}?${qs.stringify({
          exclude: [ 'minutely', 'hourly', 'alerts', 'flags' ],
          units: 'si',
        })}`);
      const weather = await res.json();
      const weatherEmbed = new MessageEmbed();

      weatherEmbed
        .setTitle(`Weather forecast for ${cords.address}`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setFooter('Powered by DarkSky')
        .setTimestamp()
        .setThumbnail(`https://favna.xyz/images/ribbonhost/weather/${weather.currently.icon}.png`)
        .setDescription(weather.daily.summary)
        .addField('💨 Wind Speed', `${weather.currently.windSpeed} km/h (${roundNumber(this.mileify(weather.currently.windSpeed), 2)} mph)`, true)
        .addField('💧 Humidity', `${weather.currently.humidity * 100}%`, true)
        .addField('🌅 Sunrise', moment(weather.daily.data[0].sunriseTime * 1000).format('HH:mm'), true)
        .addField('🌇 Sunset', moment(weather.daily.data[0].sunsetTime * 1000).format('HH:mm'), true)
        .addField('☀️ Today\'s High', `${weather.daily.data[0].temperatureHigh} °C | ${roundNumber(this.fahrenify(weather.daily.data[0].temperatureHigh), 2)} °F`, true)
        .addField('☁️️ Today\'s Low', `${weather.daily.data[0].temperatureLow} °C | ${roundNumber(this.fahrenify(weather.daily.data[0].temperatureLow), 2)} °F`, true)
        .addField('🌡️ Temperature', `${weather.currently.temperature} °C | ${roundNumber(this.fahrenify(weather.currently.temperature), 2)} °F`, true)
        .addField('🌡️ Feels Like', `${weather.currently.apparentTemperature} °C | ${roundNumber(this.fahrenify(weather.currently.apparentTemperature), 2)} °F`, true)
        .addField('🏙️ Condition', weather.daily.data[0].summary, false)
        .addField(`🛰️ Forecast ${moment.unix(weather.daily.data[1].time).format('dddd MMMM Do')}`,
          oneLine`High: ${weather.daily.data[1].temperatureHigh} °C (${roundNumber(this.fahrenify(weather.daily.data[1].temperatureHigh), 2)} °F)
          | Low: ${weather.daily.data[1].temperatureLow} °C (${roundNumber(this.fahrenify(weather.daily.data[1].temperatureLow), 2)} °F)`, false)
        .addField(`🛰️ Forecast ${moment.unix(weather.daily.data[2].time).format('dddd MMMM Do')}`,
          oneLine`High: ${weather.daily.data[2].temperatureHigh} °C (${roundNumber(this.fahrenify(weather.daily.data[2].temperatureHigh), 2)} °F)
          | Low: ${weather.daily.data[2].temperatureLow} °C (${roundNumber(this.fahrenify(weather.daily.data[2].temperatureLow), 2)} °F)`, false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(weatherEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`i wasn't able to find a location for \`${location}\``);
    }
  }
}