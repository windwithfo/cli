#!/usr/bin/env node
/**
 * @file 初始化项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */


const path     = require('path')
const inquirer = require('inquirer')
const fs       = require('fs-extra')
const program  = require('commander')
const config   = require('../lib/config')
const {
  checkTemp,
  copyTemp,
  Log
} = require('../lib/utils')

program.usage('wc init')

program.on('--help', () => {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc init', 'white')
  Log('')
})

program.parse(process.argv)

// 检查模板，没有模板会下载，有模板检查更新。
checkTemp().then(function() {
  const choices = fs.readdirSync(config.temp.dir).filter(function(file) {
    // 获取文件状态
    const info = fs.statSync(path.join(config.temp.dir, file))
    // 如果是文件夹返回文件名
    return info.isDirectory()
  })
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
  }, {
    type: 'list',
    name: 'pkg',
    message: 'select a template',
    choices: ['yarn', 'npm']
  }]).then((answers) => {
    // 判断用户输入，调用项目初始化方法
    copyTemp(path.join(config.temp.dir, answers.type), answers.name, answers.pkg)
  }).catch((error) => {
    Log(error, 'red');
  })
}, (error) => {
  Log(error, 'red')
})
