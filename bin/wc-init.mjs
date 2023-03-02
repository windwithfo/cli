#!/usr/bin/env node
/**
 * @file 初始化项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path        from 'path'
import inquirer    from 'inquirer'
import fs          from 'fs-extra'
import { program } from 'commander'
import config      from '../lib/config.mjs'
import {
  checkTemp,
  copyTemp,
  Log,
  buildTemp,
  initTemp
} from '../lib/utils.mjs'

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
    message: 'select a packageManger',
    choices: ['pnpm', 'yarn', 'npm']
  }, {
    when(answers) {
      return answers.type === 'vue2' || answers.type === 'vue3' || answers.type === 'react'
    },
    type: 'list',
    name: 'build',
    message: 'select a build tool',
    choices: ['vite', 'webpack'],
  }, {
    when(answers) {
      return answers.type === 'vue2' || answers.type === 'vue3' || answers.type === 'react'
    },
    type: 'list',
    name: 'page',
    message: 'select a page mode',
    choices: ['single', 'multi'],
  }]).then(async (answers) => {
    // 判断用户输入，调用项目初始化方法
    await copyTemp(path.join(config.temp.dir, answers.type), answers.name)
    // 安装构建用依赖库
    await initTemp(answers.name, answers.pkg)
    // 如果需要构建，执行构建脚本
    if (answers.build) {
      await buildTemp(answers.name, answers.build, answers.page)
      // 构建完成重新安装依赖
      try {
        await initTemp(answers.name, answers.pkg)
      } catch (error) {
        Log('')
        Log('*****************************************************************************', 'green')
        Log('Init project successful!', 'green')
        Log(`But error on ${answers.pkg} instatll! You can run 'cd ${answers.name}' and '${answers.pkg} install' to retry it!`, 'green')
        Log(`And then use '${answers.pkg} dev' to start project!`, 'green')
        Log('*****************************************************************************', 'green')
        fs.removeSync(path.join(answers.name, 'build'))
        return
      }
    }
    fs.removeSync(path.join(answers.name, 'build'))
    Log('')
    Log('*****************************************************************************', 'green')
    Log(`Init project successful! You can run 'cd ${answers.name}' and '${answers.pkg} dev' to start project!`, 'green')
    Log('*****************************************************************************', 'green')
  }).catch((error) => {
    Log(error, 'red')
  })
}, (error) => {
  Log(error, 'red')
})
