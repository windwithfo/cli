#!/usr/bin/env node

const Chalk = require('chalk');
const fs = require('fs-extra');
const program = require('commander');
const config = require('../lib/config');

program.usage('wc clean');

program.on('--help', () => {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ wc clean temp    删除模板文件');
  console.log('');
});

program.command('temp')
  .action(() => {
    try {
      fs.remove(config.temp.dir);
      console.log(Chalk.green(`clean temp: ${config.temp.dir} successfully`));
    }
    catch (error) {
      console.log(Chalk.red(error));
    }
  });

program.parse(process.argv);
