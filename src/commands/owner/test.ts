/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position, require-await, no-console */
/* eslint-disable no-unused-vars, consistent-return, one-var, newline-per-chained-call, no-shadow, no-undefined, newline-after-var*/

import {MessageAttachment, MessageEmbed, splitMessage} from 'discord.js';
import Jimp from 'jimp';
import {Command, util as djsutil} from 'discord.js-commando';
import path from 'path';
import util from 'util';
import {stripIndents, oneLine} from 'common-tags';
import fetch from 'node-fetch';
import fs from 'fs';
import snek from 'snekfetch';
import moment from 'moment';
import {BattleTypeChart} from '../../data/dex/typechart';
import eshop from '../../data/databases/eshop.json';
import querystring from 'querystring';

module.exports = class TestCommand extends Command {
  constructor (client) {6
    super(client, {
      name: 'test',
      memberName: 'test',
      group: 'owner',
      description: 'This is a test command',
      guildOnly: false,
      ownerOnly: true
    });
  }

  async run (msg) {
    try {
      console.log('blub');
    } catch (err) {
      console.log('failed to delete');
    }
  }
};