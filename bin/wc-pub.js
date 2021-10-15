#!/usr/bin/env node
/**
 * @file 发布项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path           = require('path')
const { build }      = require('vite')
const dotenv         = require('dotenv')
const webpack        = require('webpack')
const fs             = require('fs-extra')
const program        = require('commander')
const { Log, merge } = require('../lib/utils')

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
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config.js', 'red')
    return
  }
  // 读取项目配置文件
  const proCfg = require(path.join(process.cwd(), 'project.config.js'))
  // 读取构建配置文件
  const config = require(`../lib/${proCfg.build}/${proCfg.view}/prod.js`)
  // vite方式构建
  if (proCfg.build === 'vite') {
    const buildConfig = merge(config, proCfg.vite)
    await build({
      // 任何合法的用户配置选项，加上 `mode` 和 `configFile`
      configFile: false,
      root: process.cwd(),
      ...buildConfig
    })
    if (buildConfig.copy) {
      buildConfig.copy.forEach((item) => {
        fs.copySync(path.resolve(process.cwd(), item.from), path.resolve(process.cwd(), item.to))
        Log(`copy from${item.from} to ${item.to}`, 'green')
      })
    }
    Log('******************************************************************', 'green')
    Log('                       build successfully', 'green')
    Log('******************************************************************', 'green')
  } else {
    // webpack方式构建
    // check dll exists
    if (fs.pathExistsSync(path.join(process.cwd(), proCfg.webpack.subassetsRir || 'static', 'vendor-manifest.json')) || !proCfg.webpack.dll || proCfg.webpack.dll.length === 0) {
      // run with dll
      pub(proCfg, args.env)
    }
    else {
      // init dll first
      dll(proCfg, args.env)
    }
  }
})

program.parse(process.argv)

/**
 * 开始构建
 * 
 * @param {object} proCfg 项目配置文件
 * @param {string} env 运行环境
 */
 function pub(proCfg, env = 'production') {
  Log('build project')
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config.js', 'red')
    return
  }
  const config = require(`../lib/webpack/${proCfg.view}/prod.js`)
  if (env) {
    // 读取env文件
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
  webpack(config, (err, stats) => {
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
  Log(`config file is: ${path.join(process.cwd(), 'project.config')}`, 'green')
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config.js', 'red')
    return
  }
  const config = require(`../lib/webpack/${proCfg.view}/dll.prod.js`)
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
    pub(proCfg, env)
  })
}
