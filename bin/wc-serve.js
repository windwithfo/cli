#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const { exec } = require('child_process')
const program = require('commander')
const fs = require('fs-extra')
const path = require('path')
const { createServer } = require('vite')
const { Log } = require('../lib/utils')

program.usage('wc serve')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white');
  Log('')
  Log('    $ wc serve', 'white');
  Log('')
})

program.option('-n, --name', 'args to run sever')
program.action(async function (name) {
  if (typeof name === 'object') {
    const port = 8088
    const host = '0.0.0.0'
    const server = await createServer({
      // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
      configFile: false,
      root: process.cwd(),
      server: {
        host,
        port
      }
    })
    await server.listen()
    Log('******************************************************************', 'green')
    Log(`server is running on ${port} host is ${host}`, 'green')
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
