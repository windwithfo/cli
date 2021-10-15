#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path             = require('path')
const { createServer } = require('vite')
const dotenv           = require('dotenv')
const webpack          = require('webpack')
const fs               = require('fs-extra')
const program          = require('commander')
const { Log, merge }   = require('../lib/utils')
const DevServer        = require('webpack-dev-server')

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
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config.js', 'red')
    return
  }
  // 读取项目配置文件
  const proCfg = require(path.join(process.cwd(), 'project.config.js'))
  // 读取构建配置文件
  const config = require(`../lib/${proCfg.build}/${proCfg.view}/dev.js`)
  // vite方式构建
  if (proCfg.build === 'vite') {
    // 合并配置文件
    const buildConfig = merge(config, proCfg.vite)
    const server = await createServer({
      // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
      configFile: false,
      root: process.cwd(),
      ...buildConfig
    })
    await server.listen()
    Log('******************************************************************', 'green')
    Log(`server is running on ${buildConfig.server.port} host is ${buildConfig.server.host}`, 'green')
    Log('******************************************************************', 'green')
  } else {
    // webpack方式构建
    // check dll exists
    if (fs.pathExistsSync(path.join(process.cwd(), proCfg.webpack.subassetsRir || 'static', 'vendor-manifest.dev.json')) || !proCfg.webpack.dll || proCfg.webpack.dll.length === 0) {
      // run with dll
      run(proCfg, args.env)
    }
    else {
      // init dll first
      dll(proCfg, args.env)
    }
  }
})

program.parse(process.argv)

/**
 * 启动开发服务
 * 
 * @param {object} proCfg 项目配置文件
 * @param {string} env 运行环境
 */
 function run(proCfg, env = 'development') {
  Log('run server')
  const config = require(`../lib/webpack/${proCfg.view}/dev.js`)
  // 读取env文件
  if (env) {
    const result = dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) })
    if (result.error) {
      Log(`read ${result.error.path} faild`, 'blue')
    }
    else {
      const _env = {}
      // 遍历变量
      for (const key in result.parsed) {
        if (Object.hasOwnProperty.call(result.parsed, key)) {
          const element = result.parsed[key]
          _env[`process.env.${key}`] = JSON.stringify(element)
        }
      }
      // 写入webpack
      config.plugins.push(new webpack.DefinePlugin(_env))
    }
  }
  // for hot reload
  DevServer.addDevServerEntrypoints(config, config.devServer)
  const compiler = webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      Log(err, 'red')
      Log(stats, 'red')
      Log('build error', 'red')
      return
    }
    Log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }), 'green')
    // Done processing
    Log('******************************************************************', 'green')
    Log('                       build successfully', 'green')
    Log('******************************************************************', 'green')
    // set params
    const server = new DevServer(compiler, config.devServer)
    // set port an host
    server.listen(process.env.PORT || proCfg.webpack.dev.port, proCfg.webpack.dev.host, () => {
      Log('******************************************************************', 'green')
      Log(`server is running on ${proCfg.webpack.dev.port} host is ${proCfg.webpack.dev.host}`, 'green')
      Log('******************************************************************', 'green')
    })
  })
}

/**
 * 生成dll文件
 * 
 * @param {object} proCfg 项目配置
 * @param {string} env 运行环境
 * @returns {null}
 */
function dll(proCfg, env) {
  Log('init dll')
  Log(`config file is: ${path.join(process.cwd(), 'project.config.js')}`, 'green')
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config.js', 'red')
    return
  }
  const config = require(`../lib/webpack/${proCfg.view}/dll.dev.js`)
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      Log(err, 'red')
      Log(stats, 'red')
      Log('dll install error', 'red')
      return
    }
    // Done processing
    Log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }), 'green')
    Log('dll installed')
    run(proCfg, env)
  })
}
