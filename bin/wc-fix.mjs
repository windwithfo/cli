#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path        from 'path'
import fs          from 'fs-extra'
import inquirer    from 'inquirer'
import { program } from 'commander'
import { libPath } from '../lib/tools.js'
import config      from '../lib/config.mjs'
import {
  Log,
  merge,
  execCmd,
  checkTemp,
  getProjectCfg
} from '../lib/utils.mjs'

program.usage('wc fix')

program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc fix', 'white')
  Log('')
})

program.action(async function () {
  const answers = await inquirer.prompt([{
    type: 'list',
    name: 'type',
    message: 'select a type to fix',
    choices: ['package.json', 'project.config.mjs', 'build']
  }, {
    when(answers) {
      return answers.type === 'package.json'
    },
    type: 'list',
    name: 'pkg',
    message: 'select a packageManger',
    choices: ['pnpm', 'yarn', 'npm']
  }])

  switch (answers.type) {
    case 'package.json':
      // 检查配置文件
      if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
        Log('Missing config file: project.config.mjs', 'red')
        Log('You can run \'wc fix\' and select project.config.mjs to create', 'red')
        return
      }
      // 检查模板状态
      await checkTemp()
      // 获取项目配置文件，根据视图和构建类型找模板
      const proCfg = await getProjectCfg()
      // 读取对应模板文件
      let tempPath = config.temp.dir
      if (['vue2', 'vue3', 'react',].includes(proCfg.view)) {
        tempPath = `${tempPath}/${proCfg.view}/build/${proCfg.buildTool}/package.json`
      } else {
        tempPath = `${tempPath}/${proCfg.view}/package.json`
      }
      tempPath = path.resolve(libPath, tempPath)
      let temp
      try {
        temp = fs.readJSONSync(tempPath)
      } catch (error) {
        Log(`${proCfg.view} ${proCfg.buildTool} is not yet supported!`, 'red')
        return
      }
      // 读取本地package.json
      const json = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
      // 获得合并结果
      const ret = getJson(json, temp)
      // 覆写文件
      fs.writeJsonSync(path.join(process.cwd(), 'package.json'), ret, {
        spaces: 2
      })
      Log('remove lock files', 'green')
      fs.removeSync(path.join(process.cwd(), 'package-lock.json'))
      fs.removeSync(path.join(process.cwd(), 'yarn.lock'))
      fs.removeSync(path.join(process.cwd(), 'pnpm-lock.yaml'))
      Log('file write finish, package installing...' ,'green')
      execCmd(`${answers.pkg} install`, {}, function(err) {
        if (err) {
          Log(err, 'red')
          return
        }
        Log('******************************************************************', 'green')
        Log('                   Fix package.json successfully', 'green')
        Log('                   All package were installed', 'green')
        Log('******************************************************************', 'green')
      })
      break
    case 'project.config.mjs':
      try {
        const choices = fs.readdirSync(config.temp.dir).filter(function(file) {
          // 获取文件状态
          const info = fs.statSync(path.join(config.temp.dir, file))
          // 如果是文件夹返回文件名
          return info.isDirectory()
        })
        inquirer.prompt([{
          type: 'list',
          name: 'type',
          message: 'select a template',
          choices
        }, {
          when(res) {
            return res.type === 'vue2' || res.type === 'vue3' || res.type === 'react'
          },
          type: 'list',
          name: 'build',
          message: 'select a build tool',
          choices: ['vite', 'webpack'],
        }, {
          when(res) {
            return res.type === 'vue2' || res.type === 'vue3' || res.type === 'react'
          },
          type: 'list',
          name: 'page',
          message: 'select a page mode',
          choices: ['single', 'multi'],
        }, {
          when(res) {
            return res.type === 'package.json'
          },
          type: 'list',
          name: 'pkg',
          message: 'select a packageManger',
          choices: ['pnpm', 'yarn', 'npm']
        }]).then(async (ret) => {
          let dllTemp = `dll: ['vue', 'vuex', 'vue-router', 'axios'],`
          if (ret.type === 'react') {
            dllTemp = `dll: ['mobx', 'react', 'react-dom', 'mobx-react', 'react-loadable', 'react-router-dom', 'axios'],`
          }
          let view = ret.build === 'vite' ? `copy: [{
    from: 'project.config.mjs',
    to: 'dist/project.config.mjs'
  }],
  build: {
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), 'index.html'),
        ${ret.page === 'multi' ? 'list: resolve(process.cwd(), \'list.html\')' : ''}
      },
    }
  }` : ''
          if (ret.build === 'webpack') {
            view = ret.page === 'single' ? `${dllTemp}
  analyzerReport: false,
  copy: ['project.config.mjs'],
  assetsRir: 'dist',
  assetsPath: '/',`
  :
  `${dllTemp}
  analyzerReport: false,
  copy: ['project.config.mjs'],
  assetsRir: 'dist',
  assetsPath: '/',
  view: [{
    page: 'index',
    template: 'script/config/html.ejs',
    show: true,
    path: 'view/index/index',
    title: 'home',
    meta: {
      keywords: 'home',
      description: 'home',
      viewport: 'initial-scale=1, maximum-scale=1',
      'format-detection': 'telephone=no',
      'format-detection': 'email=no'
    }
  },
  {
    page: 'list',
    template: 'script/config/html.ejs',
    show: true,
    path: 'view/list/index',
    title: 'list',
    meta: {
      keywords: 'list',
      description: 'list'
    }
  }]`
          }
          // 获得合并结果
          const config = `
/**
 * @file 项目全局配置
 * @author dongkunshan(windwithfo@yeah.net)
 */
import { resolve } from 'path'

export default {
  view: '${ret.type}',
  buildTool: '${ret.build || ''}',
  single: ${ret.page === 'single' ? true : false},
  server: {
    port: 8080,
    proxy: {
      // 如果是 /api 打头，则访问地址如下
      '/api': {
        target: 'https://www.baidu.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\\/api/, '')
      },
    },
  },
  ${view}
}
`
          // 覆写文件
          fs.writeFileSync(path.join(process.cwd(), 'project.config.mjs'), config)
          Log('******************************************************************', 'green')
          Log('              Create project.confit.mjs successfully', 'green')
          Log('******************************************************************', 'green')
        })
      } catch (error) {
        Log(error, 'red')
      }
      break
    case 'build':
      // 检查配置文件
      if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
        Log('Missing config file: project.config.mjs', 'red')
        Log('You can run \'wc fix\' and select project.config.mjs to create', 'red')
        return
      }
      // 检查模板状态
      await checkTemp()
      const proConfig = await getProjectCfg()
      if (['vue2', 'vue3', 'react', 'electron'].includes(proConfig.view)) {
        // 拷贝build目录
        switch (proConfig.view) {
          case 'electron':
            fs.copySync(`${config.temp.dir}/vue3/build`, path.join(process.cwd(), 'build'))
            break
        
          default:
            fs.copySync(`${config.temp.dir}/${proConfig.view}/build`, path.join(process.cwd(), 'build'))
            break
        }
        Log('******************************************************************', 'green')
        Log('         copy dir build successfully', 'green')
        Log(`         Please install 'chalk' and 'fs-extra'`, 'green')
        Log(`         You can run 'node build/init.mjs' to init the project`, 'green')
        Log('******************************************************************', 'green')
      } else {
        Log(`template for ${proConfig.view} is not yet supported!`)
      }
      break
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
