/**
 * @file 工具函数集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import os       from 'os'
import ora      from 'ora'
import path     from 'path'
import chalk    from 'chalk'
import fs       from 'fs-extra'
import fetch    from 'node-fetch'
import config   from './config.mjs'
import { exec } from 'child_process'
import download from 'download-git-repo'

/**
 * 合并对象
 *
 * @param {object} source 源对象
 * @param {object} obj 待合并对象
 * @returns {object} 合并后的新对象
 */
export function merge(source, obj) {
  const ret = {}

  Object.keys(source)
    .concat(Object.keys(obj))
    .forEach((key) => {
      let value
      if (source[key] && obj[key]) {
        if (typeof source[key] === 'object') {
          value = merge(source[key], obj[key])
        } else {
          value = obj[key]
        }
      } else {
        value = source[key] ? source[key] : obj[key]
      }
      ret[key] = value
    })

  return ret
}

/**
 * 下载模板
 *
 * @param {String} url git url
 * @param {String} dir 模板存放目录
 *
 * @return {Promise}
 */
export async function getTemp(url, dir) {
  const spinner = ora(chalk.green('download template from ' + url))
  spinner.start()
  return new Promise(function(resolve) {
    // 下载模板
    download(url, dir, function(err) {
      if (!err) {
        spinner.stop()
        resolve('ok')
      }
      else {
        spinner.stop()
        Log(err, 'red')
      }
    })
  })
}

/**
 * 拷贝模板到当前目录
 *
 * @param {String} dir 模板目录
 * @param {String} dirName 目标目录名
 */
export async function copyTemp(dir, dirName, pkg) {
  Log('copy template...', 'green')
  try {
    await copyFile(dir, path.join(process.cwd(), dirName))
  }
  catch (error) {
    return Log(error, 'red')
  }
  Log('copy finish', 'green')
  // npm install
  Log(`platfrom is: ${os.platform()}`)
  Log(`goto workspace: ${path.join(process.cwd(), dirName)}`)
  Log(`use ${pkg}`, 'green')
  Log('packages install ...')

  execCmd(`${pkg} install`, {
    cwd: path.join(process.cwd(), dirName)
  }, function (err) {
    if (err) {
      Log(err, 'red')
      return
    }
    Log('packages installed')
    Log('')
    Log('*****************************************************************************', 'green')
    Log(`Init project successful! You can run 'cd ${dirName}' and 'wc dev' to start project!`, 'green')
    Log('*****************************************************************************', 'green')
  })
}

/**
 * 复制文件
 *
 * @param {String} from 源路径
 * @param {String} to 目标路径
 */
export async function copyFile(from, to) {
  try {
    await fs.copy(from, to)
    Log(`copy from ${from} to ${to} success!`, 'green')
  } catch (err) {
    Log(err, 'red')
  }
}

/**
 * 检查模板
 *
 * @return {Promise}
 */
export function checkTemp() {
  return new Promise(async function(resolve) {
    try {
      fs.statSync(config.temp.dir)
    }
    catch (e) {
      Log('template is not exists')
      await getTemp(config.temp.url, config.temp.dir)
      Log('get template suceess', 'green')
      resolve('ok')
      return
    }
    try {
      const ret = await fetch('https://raw.githubusercontent.com/windwithfo/temps/master/package.json')
      const packageJson = await ret.json()
      let _packageJson
      try {
         _packageJson = fs.readJSONSync(path.resolve(config.temp.dir, './package.json'))
      } catch (error) {
         _packageJson = {version: '0.0.1'}
      }
      const version = packageJson.version
      const _version = _packageJson.version
      if (version === _version) {
        Log('template is latest', 'green')
        resolve('ok')
      } else {
        Log('template need update', 'green')
        fs.removeSync(config.temp.dir)
        await getTemp(config.temp.url, config.temp.dir)
        Log('update template suceess', 'green')
        resolve('ok')
      }
    } catch (error) {
      Log(error, 'red')
      resolve('ok')
    }
  })
}

/**
 * exec调用封装
 * 
 * @param {stirng}} cmd 待执行命令
 * @param {Object} option 参数
 * @param {Function} callback 回调
 */
export function execCmd(cmd, option, callback) {
  Log(`exec:${cmd}`, 'green')
  const workerProcess = exec(cmd, option, callback)

  workerProcess.stdout.on('data', function (data) {
    if (data.indexOf('Warnings') > -1) {
      Log(data, 'yellow')
    } if(data.indexOf('error') > -1) {
      Log(data, 'red')
    } else {
      Log(data, 'white')
    }
  })

  workerProcess.stderr.on('data', function (data) {
    Log(data, 'yellow')
  })
}

/**
 * log封装
 *
 * @param {string} msg 打印信息
 * @param {string} to 输出颜色 默认为蓝色
 */
export function Log(msg, color = 'blue') {
  console.log(chalk[color](msg))
}

/**
 * 获取项目配置文件
 * 
 * @returns {object} config
 */
export async function getProjectCfg() {
  const filePath = path.resolve(process.cwd(), 'project.config.mjs').replace(/([A-Z]:)+/, 'file:\\$1')
  const config = (await import(filePath)).default
  return config
}
