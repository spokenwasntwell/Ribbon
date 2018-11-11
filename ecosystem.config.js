module.exports = {
  apps: [
    {
      args: "./src/app.ts",
      name: "ribbon",
      script: "./node_modules/.bin/ts-node",
    },
  ],
};
