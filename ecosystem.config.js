/* eslint-disable camelcase */

module.exports = {
  apps: [
    {
      name: 'ribbon',
      script: './node_modules/.bin/ts-node',
      args: './src/app.ts',
    }
  ],
};