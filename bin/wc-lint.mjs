#!/usr/bin/env node
/**
 * @file lint格式校验命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path     from 'path'
import program  from 'commander'
import { exec } from 'child_process'
import { Log }  from '../lib/utils.mjs'

program.usage('wc lint')
 
program.on('--help', () => {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc lint', 'white')
  Log('')
})
const rootPath = path.parse(import.meta.url).dir.replace('file://', '')
const jsConfig = path.resolve(rootPath, '../lib/lint/js.cfg.js')
const vueConfig = path.resolve(rootPath, '../lib/lint/vue.cfg.js')
const lintPath = path.resolve(rootPath, '../node_modules/.bin/eslint')
 
program.action(async function () {
  // 读取project.config.json下的lint配置
  let proConfig
  try {
    proConfig = require(path.resolve(process.cwd(), 'project.config.js'))
  } catch (error) {
    Log(`project.config.js not found, use default config`)
    proConfig = {
      lint: {
        'autoFix': true,
        'root': 'src',
        'ext': ['.js', '.jsx', 'ts', 'tsx'],
        'ignore': ['assets', '@types'],
      },
      view: 'vue',
    }
  }
   
  const confg = proConfig.lint
  let cmdParam = ''
  for (let key in confg) {
    switch (key) {
      case 'autoFix':
        if (confg[key]) {
          cmdParam += ' --fix'
        }
        break
      case 'root':
        cmdParam += ` ${confg[key]}`
        break
      case 'ignore':
        confg[key].forEach((v) => {
          cmdParam += ` --ignore-pattern **/${v}/`
        })
        break
      default:
        break
    }
  }

  const vueCmdStr = proConfig.view.indexOf('vue') === 0 ? `${lintPath} -c ${vueConfig} ${cmdParam} --ext .vue` : ''
  const cmdStr = `${lintPath} -c ${jsConfig} ${cmdParam} --ext ${confg.ext.join()} ${vueCmdStr ? '&& ' + vueCmdStr : ''}`
  Log(`exec: ${cmdStr}`)
  const workerProcess = exec(cmdStr, { maxBuffer: 1024 * 1024 * 1024 }, (err) => {
    if (!err) {
      Log('Lint code style finish!', 'green')
    }
    else {
      Log('Lint code style finish!', 'red')
    }
  })
 
  workerProcess.stdout.on('data', function (data) {
    if (data.indexOf('warnings') > -1) {
      Log(data, 'yellow')
    } if(data.indexOf('error') > -1) {
      Log(data, 'red')
    } else {
      Log(data, 'green')
    }
  })
 
  workerProcess.stderr.on('data', function (data) {
    Log(data, 'yellow')
  })
})
 
program.parse(process.argv)