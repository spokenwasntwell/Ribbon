import { suite, test } from 'mocha-typescript';
import { Client, SyncSQLiteProvider } from 'discord.js-commando';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as Database from 'better-sqlite3';

suite('Connect & Disconnect bot', () => {
  dotenv.config({ path: path.join(__dirname, '../src/.env') });
  test('should connect then disconnect', () => {
    const client = new Client({
        commandPrefix: 's!!',
        owner: '112001393140723712',
        unknownCommandResponse: false,
      }),
      db = new Database(path.join(__dirname, '../src/data/databases/settings.sqlite3'));

    client.setProvider(
      new SyncSQLiteProvider(db)
    );
    let readyTracker = false;

    client.registry.registerDefaults();
    client.login(process.env.TEST_TOKEN);

    client.on('ready', () => {
      readyTracker = true;
      client.destroy();
      process.exit();
      expect(readyTracker).to.be.ok;
    });
  });
});