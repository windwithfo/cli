#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                          from 'path'
import { createServer }              from 'vite'
import dotenv                        from 'dotenv'
import webpack                       from 'webpack'
import fs                            from 'fs-extra'
import program                       from 'commander'
import { Log, merge, getProjectCfg } from '../lib/utils.mjs'
import DevServer                     from 'webpack-dev-server'

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
  // 读取项目配置文件
  const proCfg = await getProjectCfg()
  // 读取构建配置文件
  const config = (await import(`../lib/${proCfg.build}/${proCfg.view}/dev.mjs`)).default
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
async function run(proCfg, env = 'development') {
  Log('run server')
  const config = (await import(`../lib/webpack/${proCfg.view}/dev.mjs`)).default
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
  const compiler = webpack(config)
  // set params
  const server = new DevServer(config.devServer, compiler)
  await server.start()
}

/**
 * 生成dll文件
 * 
 * @param {object} proCfg 项目配置
 * @param {string} env 运行环境
 * @returns {null}
 */
async function dll(proCfg, env) {
  Log('init dll')
  Log(`config file is: ${path.join(process.cwd(), 'project.config.mjs')}`, 'green')
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
    Log('missing config file: project.config.mjs', 'red')
    return
  }
  const config = (await import(`../lib/webpack/${proCfg.view}/dll.dev.mjs`)).default
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
