#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import fs               from 'fs-extra'
import { program }      from 'commander'
import { Log, execCmd } from '../lib/utils.mjs'

program.usage('wc dev')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc dev', 'white')
  Log('    $ wc dev -e test', 'white')
  Log('    $ wc dev --env test', 'white')
  Log('')
})

program.option('-e, --env <dotenv>', 'env name to run')
program.action(async function (args) {
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
    Log('missing config file: project.config.mjs', 'red')
    return
  }
  execCmd(`node script/dev.mjs --env=${args.env || 'development'}`)
})

program.parse(process.argv)
