import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

export default class TestCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'test',
      group: 'owner',
      memberName: 'test',
      description: 'This is a test command',
      guildOnly: false,
      ownerOnly: true,
    });
  }

  public run (msg: CommandMessage) {
    return msg.say('derp');
  }
}