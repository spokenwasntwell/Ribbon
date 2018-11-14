/* tslint:disable:no-unused-expression*/
/* tslint:disable:no-implicit-dependencies*/

import { expect } from 'chai';
import {load} from 'dotenv';
import { suite, test } from 'mocha-typescript';
import * as path from 'path';

suite('Check dotenv', () => {
  load({
      path: path.join(__dirname, '../src/.env'),
      encoding: 'utf8',
      debug: false,
  });

  test('ribbon token should be set', () => {
    const token = process.env.BOT_TOKEN;

    expect(token).to.be.ok;
  });
  test('google api token should be set', () => {
    const token = process.env.GOOGLE_API_KEY;

    expect(token).to.be.ok;
  });
});