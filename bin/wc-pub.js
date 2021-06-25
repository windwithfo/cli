#!/usr/bin/env node
/**
 * @file 发布项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs-extra')
const path = require('path')
const program = require('commander')
const { build } = require('vite')
const { exec } = require('child_process')
const { Log } = require('../lib/utils')

program.usage('wc pub');

program.on('--help', function () {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc pub', 'white');
  Log('');
});

program.option('-n, --name', 'package name to pub')
program.action(async function (name) {
  if (typeof name === 'object') {
    if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
      Log('missing config file: project.config.js', 'red')
      return
    }
    const proCfg = require(path.join(process.cwd(), 'project.config.js'))
    const config = require(`../lib/vite/${proCfg.view}.prod.js`)
    Object.assign(config.build.rollupOptions.input, proCfg.input)
    await build({
      // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
      configFile: false,
      root: process.cwd(),
      ...config
    })
    Log('******************************************************************', 'green')
    Log('                       build successfully', 'green');
    Log('******************************************************************', 'green')
  }
  else {
    Log(`pub in multi package is ${name}`)
    const workerProcess = exec('wc pub', {
      cwd: path.join(process.cwd(), 'packages', name)
    }, function () {
      exec(`rm -rf dist/${name} && mv packages/${name}/dist dist/${name}`)
    })
    workerProcess.stdout.on('data', function (data) {
      Log(data, 'green');
    })

    workerProcess.stderr.on('data', function (data) {
      Log(data, 'red');
    })
  }
})

program.parse(process.argv)
