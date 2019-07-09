#!/usr/bin/env node

const Chalk = require('chalk');
const webpack = require('webpack');
const program = require('commander');
const DevServer = require('webpack-dev-server');

const { fileExists } = require('../lib/utils');

program.usage('wc run');

program.on('--help', function() {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ wc run');
  console.log('');
});

program.parse(process.argv);

// check dll exists
if (fileExists(process.cwd() + '/static/vendor-manifest.json')) {
  // run with dll
  run();
}
else {
  // init dll first
  dll();
}

function run() {
  console.log(Chalk.blue('run server'));
  if (!fileExists(process.cwd() + '/project.config.json')) {
    console.log(Chalk.red('missing config file: project.config.json'));
    return;
  }
  const proCfg = require(process.cwd() + '/project.config.json');
  const config = require('../lib/webpack/dev.' + (proCfg.view || 'react'));
  // for hot reload
  DevServer.addDevServerEntrypoints(config, config.devServer);
  const compiler = webpack(config);
  // set params
  const server = new DevServer(compiler, config.devServer);
  // set port an host
  server.listen(process.env.PORT || proCfg.dev.port, proCfg.dev.host, () => {
    console.log(Chalk.green('******************************************************************'));
    console.log(Chalk.green(`server is running on ${proCfg.dev.port} host is ${proCfg.dev.host}`));
    console.log(Chalk.green('******************************************************************'));
  });
}

function dll() {
  console.log(Chalk.blue('init dll'));
  console.log(Chalk.green('config file is: ' + process.cwd() + '/project.config.json'));
  if (!fileExists(process.cwd() + '/project.config.json')) {
    console.log(Chalk.red('missing config file: project.config.json'));
    return;
  }
  const config = require('../lib/webpack/dll');
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      console.log(Chalk.red(stats));
      console.log(Chalk.red('dll install error'));
      return;
    }
    // Done processing
    console.log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }));
    console.log(Chalk.blue('dll installed'));
    run();
  });
}
