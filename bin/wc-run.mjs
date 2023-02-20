#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import fs               from 'fs-extra'
import inquirer         from 'inquirer'
import { program }      from 'commander'
import { Log, execCmd } from '../lib/utils.mjs'
 
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
  const scripts = packageInfo.scripts || { noscript: '--help'}
  let cmd = '--help'
  let pkg = 'pnpm'
  if (args.name === undefined) {
    // 获取用户输入
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'name',
      message: 'select a script to run',
      choices: Object.keys(scripts),
    }, {
      type: 'list',
      name: 'pkg',
      message: 'select a pkg to run',
      choices: ['pnpm', 'yarn' , 'npm'],
    }])
    cmd = answers.name
    pkg = answers.pkg
  }
  else {
    if (!scripts[args.name]) {
      Log(`scripts has no ${args.name} to run`, 'red')
      return
    }
    cmd = args.name
  }

  execCmd(`${pkg + ' run'} ${scripts[cmd]}`)
})
 
program.parse(process.argv) 
