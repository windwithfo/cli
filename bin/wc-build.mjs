#!/usr/bin/env node
/**
 * @file 发布项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import fs               from 'fs-extra'
import { program }      from 'commander'
import { Log, execCmd } from '../lib/utils.mjs'

program.usage('wc pub')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc pub -e test', 'white')
  Log('    $ wc pub --env test', 'white')
  Log('')
})

program.option('-e, --env <dotenv>', 'env name to run')
program.action(async function (args) {
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
    Log('missing config file: project.config.mjs', 'red')
    return
  }
  execCmd(`node script/build.mjs --env=${args.env || 'production'}`)
})

program.parse(process.argv)
