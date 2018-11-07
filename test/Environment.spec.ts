import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import * as path from 'path';

suite('Check dotenv', () => {
  dotenv.config({ path: path.join(__dirname, '../src/.env') });
  test('ribbon token should be set', () => {
    const token = process.env.BOT_TOKEN;

    expect(token).to.be.ok;
  });
  test('google api token should be set', () => {
    const token = process.env.GOOGLE_API_KEY;

    expect(token).to.be.ok;
  });
});