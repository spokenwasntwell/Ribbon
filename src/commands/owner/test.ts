/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position, require-await, no-console */
/* eslint-disable no-unused-vars, consistent-return, one-var, newline-per-chained-call, no-shadow, no-undefined, newline-after-var*/

import { Command } from 'discord.js-commando';

export default class TestCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      memberName: 'test',
      group: 'owner',
      description: 'This is a test command',
      guildOnly: false,
      ownerOnly: true,
    });
  }

  run (msg) {
    return msg.say('derp');
  }
}