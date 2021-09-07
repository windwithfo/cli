#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path             = require('path')
const { createServer } = require('vite')
const fs               = require('fs-extra')
const program          = require('commander')
const { Log }          = require('../lib/utils')
const { exec }         = require('child_process')

program.usage('wc dev')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc dev', 'white')
  Log('')
})

program.option('-n, --name', 'package name to run')
program.action(async function (name) {
  if (typeof name === 'object') {
    if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
      Log('missing config file: project.config.js', 'red')
      return
    }
    const proCfg = require(path.join(process.cwd(), 'project.config.js'))
    const config = require(`../lib/vite/${proCfg.view}.dev.js`)
    Object.assign(config.server, proCfg.server)
    const server = await createServer({
      // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
      configFile: false,
      root: process.cwd(),
      ...config
    })
    await server.listen()
    Log('******************************************************************', 'green')
    Log(`server is running on ${config.server.port} host is ${config.server.host}`, 'green')
    Log('******************************************************************', 'green')
  }
  else {
    Log(`run in multi package is ${name}`)
    const workerProcess = exec('wc run', {
      cwd: path.join(process.cwd(), 'packages', name)
    })
    workerProcess.stdout.on('data', function (data) {
      Log(data, 'green')
    })

    workerProcess.stderr.on('data', function (data) {
      Log(data, 'red')
    })
  }
})

program.parse(process.argv)
