#!/usr/bin/env node
/**
 * @file 清理项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs-extra');
const program = require('commander');
const config = require('../lib/config');
const { Log } = require('../lib/utils');

program.usage('wc clean');

program.on('--help', () => {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc clean temp    删除模板文件', 'white');
  Log('');
});

program.command('temp')
  .action(() => {
    try {
      fs.remove(config.temp.dir);
      Log(`clean temp: ${config.temp.dir} successfully`, 'green');
    }
    catch (error) {
      Log(error, 'red');
    }
  });

program.parse(process.argv);
