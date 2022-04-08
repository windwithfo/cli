#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path        from 'path'
import fs          from 'fs-extra'
import program     from 'commander'
import { libPath } from '../lib/tools.js'
import {
  Log,
  merge,
  execCmd,
  getProjectCfg
} from '../lib/utils.mjs'

program.usage('wc fix')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc fix', 'white')
  Log('    $ wc fix -p', 'white')
  Log('    $ wc fix --package', 'white')
  Log('    $ wc fix -c', 'white')
  Log('    $ wc fix --config', 'white')
  Log('')
})

program.option('-p, --package', 'fix package.json')
program.option('-c, --config', 'fix project.config.mjs')
program.action(async function (args) {
  if (args.config) {
    try {
      fs.copyFileSync(path.resolve(libPath, './fix/project.config.mjs'), path.join(process.cwd(), 'project.config.mjs'))
      Log('******************************************************************', 'green')
      Log('                   Create project.confit.mjs successfully', 'green')
      Log('******************************************************************', 'green')
    } catch (error) {
      Log(error, 'red')
    }
  }
  if (args.package) {
    if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
      Log('missing config file: project.config.mjs', 'red')
      return
    }
    // 获取项目配置文件，根据视图和构建类型找模板
    const proCfg = await getProjectCfg()
    // 读取对应模板文件
    let temp
    try {
      temp = (await import(`../lib/fix/${proCfg.view}/${proCfg.build}.package.mjs`)).default
    } catch (error) {
      Log(`${proCfg.view}-${proCfg.build} package.json temp is not yet supported!`, 'red')
      return
    }
    
    // 读取本地package.json
    const json = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
    // 获得合并结果
    const ret = getJson(json, temp)
    // 覆写文件
    fs.writeJson(path.join(process.cwd(), 'package.json'), ret, {
      spaces: 2
    })
    Log('remove lock files', 'green')
    fs.removeSync(path.join(process.cwd(), 'package-lock.json'))
    fs.removeSync(path.join(process.cwd(), 'yarn.lock'))
    Log('file write finish, package installing...' ,'green')
    execCmd('yarn', {}, function(err) {
      if (err) {
        Log(err, 'red')
        return
      }
      Log('******************************************************************', 'green')
      Log('                   Fix package.json successfully', 'green')
      Log('                   All package were installed', 'green')
      Log('******************************************************************', 'green')
    })
  }
})

program.parse(process.argv)

/**
 * 合并json文件
 * 
 * @param {object} json 项目的package.json
 * @param {object} temp 模板的数据
 * @returns {object}
 */
function getJson(json, temp) {
  // 对dependencies进行属性合并
  json.dependencies = merge(json.dependencies, temp.dependencies)
  // 对devDependencies进行属性合并
  json.devDependencies = merge(json.devDependencies, temp.devDependencies)
  // 删除dependencies中应该放在devDependencies中的属性
  Object.keys(temp.devDependencies).forEach((pkg) => {
    if (json.dependencies[pkg]) {
      delete json.dependencies[pkg]
    }
  })
  // 删除devDependencies中应该放在dependencies中的属性
  Object.keys(temp.dependencies).forEach((pkg) => {
    if (json.devDependencies[pkg]) {
      delete json.devDependencies[pkg]
    }
  })
  // 虽然改变了对象内容，还是推荐把对象return出去
  return json
}
