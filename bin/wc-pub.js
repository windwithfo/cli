#!/usr/bin/env node

const Chalk = require('chalk');
const webpack = require('webpack');
const program = require('commander');

const { fileExists } = require('../lib/utils');

program.usage('wc pub');

program.on('--help', function() {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ wc pub');
  console.log('');
});

program.parse(process.argv);

// check dll exists
if (fileExists(process.cwd() + '/static/vendor-manifest.json')) {
  // run with dll
  pub();
}
else {
  // init dll first
  dll();
}

function pub() {
  console.log(Chalk.blue('build project'));
  if (!fileExists(process.cwd() + '/project.config.json')) {
    console.log(Chalk.red('missing config file: project.config.json'));
    return;
  }
  const proCfg = require(process.cwd() + '/project.config.json');
  const config = require('../lib/webpack/prod.' + (proCfg.view || 'react'));
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      console.log(Chalk.red(stats));
      console.log(Chalk.red('build error'));
      return;
    }
    console.log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }));
    // Done processing
    console.log(Chalk.green('******************************************************************'));
    console.log(Chalk.green('                       build successfully'));
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
    pub();
  });
}
