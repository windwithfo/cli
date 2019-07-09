#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Chalk = require('chalk');
const inquirer = require('inquirer');
const program = require('commander');
const config = require('../lib/config');

const { checkTemp, copyTemp } = require('../lib/utils');

program.usage('wc init');

program.on('--help', () => {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ wc init');
  console.log('');
});

program.parse(process.argv);

// 检查模板，没有模板会下载，有模板检查更新。
checkTemp().then(function() {
  const choices = fs.readdirSync(config.temp.dir).filter(function(file) {
    // 获取文件状态
    const info = fs.statSync(path.join(config.temp.dir, file));
    // 如果是文件夹返回文件名
    return info.isDirectory();
  });
  // 获取用户输入
  inquirer.prompt([{
    type: 'list',
    name: 'type',
    message: 'select a template',
    choices
  }, {
    type: 'input',
    name: 'name',
    message: 'input your project name',
    default: 'demo'
  }]).then((answers) => {
    // 判断用户输入，调用项目初始化方法
    copyTemp(path.join(config.temp.dir, answers.type), answers.name);
  }).catch((error) => {
    console.log(Chalk.red(error));
  });
}, (error) => {
  console.log(Chalk.red(error));
});
