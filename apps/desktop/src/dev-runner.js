// Dev-only entry point.
// Electron loads this as plain CommonJS, which lets ts-node register
// its require hook before main.ts is touched by the ESM loader.
require('ts-node').register({
  project: require('path').join(__dirname, '../tsconfig.json'),
  transpileOnly: true,
});
require('./main.ts');
