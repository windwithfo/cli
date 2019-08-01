#!/usr/bin/env node
/**
 * @file lint格式校验命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs');
const path = require('path');
// const inquirer = require('inquirer');
const program = require('commander');
// const config = require('../lib/config');
const { exec } = require('child_process');

program.usage('wc lint');

program.on('--help', () => {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc lint', 'white');
  Log('');
});

program.parse(process.argv);

const lintPath = path.resolve(__dirname, '../node_modules/.bin/eslint');
let cfgPath = path.resolve(__dirname, '../lib/lint/js.react.cfg.js');

// 读取project.config.json下的lint配置，集成到命令行中
let lintConfigPath = path.resolve(process.cwd(), 'project.config.json');
let cfgDate;
try {
  // 读取成功
  cfgDate = JSON.parse(fs.readFileSync(lintConfigPath, 'utf-8'));
} catch (e) {
  // 读取失败，设置默认值
  cfgDate = {
    'view': 'react',
    'lint': {
      'autoFix': true,
      'root': 'src',
      'ext': ['.js', '.jsx', '.vue'],
      'ignore': ['assets']
    }
  };
}
// 根据模板框架，设置相应的lint配置文件
if (cfgDate.view === 'vue') {
  cfgPath = path.resolve(__dirname, '../lib/lint/js.cfg.js');
}
// 集成命令行
let cmdParam = lintPath + ' -c ' + cfgPath;
let lintConfig = cfgDate.lint;
for (let key in lintConfig) {
  switch (key) {
    case 'autoFix':
      if (lintConfig[key]) {
        cmdParam += ' --fix';
      }
      break;
    case 'root':
      cmdParam += ' ' + lintConfig[key];
      break;
    case 'ext':
      cmdParam += ' --ext ' + lintConfig[key].join();
      break;
    case 'ignore':
      lintConfig[key].forEach((v) => {
        cmdParam += ' --ignore-pattern' + ' **/' + v + '/';
      });
      break;
    default:
      break;
  }
}
exec(cmdParam, (error, out) => {
  if (out) {
    Log(out, 'green');
  } else {
    Log('Lint code style successfully!', 'green');
  }
});
