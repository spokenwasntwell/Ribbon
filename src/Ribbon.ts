import * as Database from 'better-sqlite3';
import * as path from 'path';
import { GuildMember, Message, RateLimitData } from 'discord.js';
import { Client, CommandMessage, CommandoClient, CommandoGuild, SyncSQLiteProvider } from 'discord.js-commando';
import { handleCmdErr, handleDebug, handleErr, handleGuildJoin, handleGuildLeave, 
  handleMemberJoin, handleMemberLeave, handleMsg, handlePresenceUpdate, handleRateLimit,
  handleReady, handleRejection, handleUnknownCmd, handleWarn } from './components/events';

export default class Ribbon {
  token: string;
  client: CommandoClient;

  constructor (token : string) {
    this.token = token;
    this.client = new Client({
      commandPrefix: '!',
      owner: [ '112001393140723712', '268792781713965056' ],
      unknownCommandResponse: false,
      typescript: true,
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
            smallText: 'https://favna.xyz/redirect/ribbon',
          },
        },
      },
    });
  }

  init () {
    this.client
      .on('commandError', (cmd, err, msg) => handleCmdErr(this.client, cmd, err, msg))
      .on('debug', (info : string) => handleDebug(info))
      .on('error', (err : string) => handleErr(this.client, err))
      .on('guildCreate', (guild : CommandoGuild) => handleGuildJoin(this.client, guild))
      .on('guildDelete', (guild : CommandoGuild) => handleGuildLeave(this.client, guild))
      .on('guildMemberAdd', (member : GuildMember) => handleMemberJoin(this.client, member))
      .on('guildMemberRemove', (member : GuildMember) => handleMemberLeave(this.client, member))
      .on('message', (message : Message) => handleMsg(this.client, message))
      .on('presenceUpdate', (oldMember : GuildMember, newMember : GuildMember) => handlePresenceUpdate(this.client, oldMember, newMember))
      .on('rateLimit', (info : RateLimitData) => handleRateLimit(this.client, info))
      .on('ready', () => handleReady(this.client))
      .on('unknownCommand', (message : CommandMessage) => handleUnknownCmd(this.client, message))
      .on('warn', (warn : string) => handleWarn(this.client, warn));
    process.on('unhandledRejection', (reason : Error | any, p : Promise<any>) => handleRejection(this.client, reason, p));

    /* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
    const db = new Database(path.join(__dirname, 'data/databases/settings.sqlite3'));
    
    this.client.setProvider(
      new SyncSQLiteProvider(db)
    );

    this.client.registry
      .registerGroups([
        [ 'games', 'Games - Play some games' ],
        [ 'casino', 'Casino - Gain and gamble points' ],
        [ 'info', 'Info - Discord info at your fingertips' ],
        [ 'music', 'Music - Let the DJ out' ],
        [ 'searches', 'Searches - Browse the web and find results' ],
        [ 'leaderboards', 'Leaderboards - View leaderboards from various games' ],
        [ 'pokemon', 'Pokemon - Let Dexter answer your questions' ],
        [ 'extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!' ],
        [ 'weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs' ],
        [ 'moderation', 'Moderation - Moderate with no effort' ],
        [ 'automod', 'Automod - Let Ribbon moderate the chat for you' ],
        [ 'streamwatch', 'Streamwatch - Spy on members and get notified when they go live' ],
        [ 'custom', 'Custom - Server specific commands' ],
        [ 'nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)' ],
        [ 'owner', 'Owner - Exclusive to the bot owner(s)' ]
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({
        help: true,
        prefix: true,
        ping: true,
        eval: true,
      })
      .registerCommandsIn({
        dirname: path.join(__dirname, 'commands'),
        filter: (fileName : string) => (/\.ts/).test(fileName) ? fileName : null,
      });

    return this.client.login(this.token);
  }
}