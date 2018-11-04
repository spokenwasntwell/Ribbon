import path from 'path';
import {Client, SyncSQLiteProvider, CommandoClient} from 'discord.js-commando';
import {handleCmdErr, handleDebug, handleErr, handleGuildJoin, handleGuildLeave,
  handleMemberJoin, handleMemberLeave, handleMsg, handlePresenceUpdate,
  handleRateLimit, handleReady, handleUnknownCmd, handleWarn} from './components/events';
import * as Database from 'better-sqlite3';

export default class Ribbon {
  token: string;
  client: CommandoClient;
  constructor (token) {
    this.token = token;
    this.client = new Client({
      commandPrefix: '!',
      owner: ['112001393140723712', '268792781713965056'],
      unknownCommandResponse: false,
      presence: {
        status: 'online',
        activity: {
          application: '376520643862331396',
          name: '@Ribbon help',
          type: 'WATCHING',
          details: 'Made by Favna',
          state: 'https://favna.xyz/ribbon',
          assets: {
            largeImage: '385133227997921280',
            smallImage: '385133144245927946',
            largeText: 'Invite me to your server!',
            smallText: 'https://favna.xyz/redirect/ribbon'
          }
        }
      }
    });
  }

  init () {
    this.client
      .on('commandError', (cmd, err, msg) => handleCmdErr(this.client, cmd, err, msg))
      .on('debug', info => handleDebug(info))
      .on('error', err => handleErr(this.client, err))
      .on('guildCreate', guild => handleGuildJoin(this.client, guild))
      .on('guildDelete', guild => handleGuildLeave(this.client, guild))
      .on('guildMemberAdd', member => handleMemberJoin(this.client, member))
      .on('guildMemberRemove', member => handleMemberLeave(this.client, member))
      .on('message', message => handleMsg(this.client, message))
      .on('presenceUpdate', (oldMember, newMember) => handlePresenceUpdate(this.client, oldMember, newMember))
      .on('rateLimit', info => handleRateLimit(this.client, info))
      .on('ready', () => handleReady(this.client))
      .on('unknownCommand', message => handleUnknownCmd(this.client, message))
      .on('warn', warn => handleWarn(this.client, warn));

    const db = new Database(path.join(__dirname, 'data/databases/settings.sqlite3'));

    this.client.setProvider(
      new SyncSQLiteProvider(db)
    );

    /* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/

    this.client.registry
      // .registerGroups([
      //   ['games', 'Games - Play some games'],
      //   ['casino', 'Casino - Gain and gamble points'],
      //   ['info', 'Info - Discord info at your fingertips'],
      //   ['music', 'Music - Let the DJ out'],
      //   ['searches', 'Searches - Browse the web and find results'],
      //   ['leaderboards', 'Leaderboards - View leaderboards from various games'],
      //   ['pokemon', 'Pokemon - Let Dexter answer your questions'],
      //   ['extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!'],
      //   ['weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs'],
      //   ['moderation', 'Moderation - Moderate with no effort'],
      //   ['automod', 'Automod - Let Ribbon moderate the chat for you'],
      //   ['streamwatch', 'Streamwatch - Spy on members and get notified when they go live'],
      //   ['custom', 'Custom - Server specific commands'],
      //   ['nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)'],
      //   ['owner', 'Owner - Exclusive to the bot owner(s)']
      // ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({
        help: true,
        prefix: true,
        ping: true,
        eval: true,
        commandState: true
      });
    // .registerCommandsIn(path.join(__dirname, 'commands'));

    return this.client.login(this.token);
  }
}