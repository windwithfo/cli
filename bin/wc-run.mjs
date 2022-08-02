#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path        from 'path'
import fs          from 'fs-extra'
import inquirer    from 'inquirer'
import { program } from 'commander'
import { exec }    from 'child_process'
import { Log }     from '../lib/utils.mjs'
 
program.usage('wc run')
 
program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc run', 'white')
  Log('    $ wc run -n, --name <name>', 'white')
  Log('')
})
 
program.option('-n, --name <name>', 'script name to run')
program.action(async function (args) {
  const packageInfo = fs.readJSONSync(path.resolve(process.cwd(), './package.json'))
  const scripts = packageInfo.scripts || { noscript: 'echo noscript'}
  let cmd
  if (args.name === undefined) {
    // 获取用户输入
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'name',
      message: 'select a script to run',
      choices: Object.keys(scripts),
    }])
    cmd = answers.name
  }
  else {
    if (!scripts[args.name]) {
      Log(`scripts has no ${args.name} to run`, 'red')
      return
    }
    cmd = args.name
  }
  const workerProcess = exec(`yarn run ${scripts[cmd]}`)
 
  workerProcess.stdout.on('data', function (data) {
    if (data.indexOf('Warnings') > -1) {
      Log(data, 'yellow')
    } if(data.indexOf('error') > -1) {
      Log(data, 'red')
    } else {
      Log(data, 'green')
    }
  })
 
  workerProcess.stderr.on('data', function (data) {
    Log(data, 'red')
  })
})
 
program.parse(process.argv) 
