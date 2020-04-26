/**
 * @file 工具函数集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs-extra');
const os = require('os');
const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const config = require('./config');
const download = require('download-git-repo');

const { exec } = require('child_process');

/**
 * 下载模板
 *
 * @param {String} url git url
 * @param {String} dir 模板存放目录
 *
 * @return {Promise}
 */
async function getTemp(url, dir) {
  const spinner = ora(chalk.green('download template from ' + url));
  spinner.start();
  return new Promise(function(resolve) {
    // 下载模板
    download(url, dir, function(err) {
      if (!err) {
        spinner.stop();
        resolve('ok');
      }
      else {
        spinner.stop();
        Log(err, 'red');
      }
    });
  });
}

/**
 * 拷贝模板到当前目录
 *
 * @param {String} dir 模板目录
 * @param {String} dirName 目标目录名
 */
async function copyTemp(dir, dirName, pkg) {
  Log('copy template...', 'green');
  try {
    await copyFile(dir, path.join(process.cwd(), dirName));
  }
  catch (error) {
    return Log(error, 'red');
  }
  Log('copy finish', 'green');
  // npm install
  Log(`platfrom is: ${os.platform()}`);
  Log(`goto workspace: ${path.join(process.cwd(), dirName)}`);
  Log(`use ${pkg}`, 'green');
  Log('packages install ...');

  const workerProcess = exec(`${pkg} install`, {
    cwd: path.join(process.cwd(), dirName)
  }, function () {
    Log('packages installed');
    Log('');
    Log('*****************************************************************************', 'green');
    Log(`Init project successful! You can run 'cd ${dirName}' and 'wc run' to start project!`, 'green');
    Log('*****************************************************************************', 'green');
  });

  workerProcess.stdout.on('data', function (data) {
    Log(data, 'white');
  });

  workerProcess.stderr.on('data', function (data) {
    Log(data, 'yellow');
  });
}

/**
 * 复制文件
 *
 * @param {String} from 源路径
 * @param {String} to 目标路径
 */
async function copyFile(from, to) {
  try {
    await fs.copy(from, to);
    Log(`copy from ${from} to ${to} success!`, 'green')
  } catch (err) {
    Log(err, 'red');
  }
}

/**
 * 检查模板
 *
 * @return {Promise}
 */
async function checkTemp() {
  return new Promise(async function(resolve) {
    try {
      fs.statSync(config.temp.dir);
    }
    catch (e) {
      Log('templage is not exists');
      await getTemp(config.temp.url, config.temp.dir);
      resolve('ok');
    }
    Log('get template suceess');
    resolve('ok');
  });
}

function Log(msg, color = 'blue') {
  console.log(chalk[color](msg));
}

module.exports = {
  copyTemp,
  copyFile,
  checkTemp,
  Log
};
