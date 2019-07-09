/**
 * @file 工具函数集合
 * @author dongkunshan(dongkunshan@gaosiedu.com)
 */

const fs = require('fs');
const os = require('os');
const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const config = require('./config');
const download = require('download-git-repo');

const { execSync } = require('child_process');

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
        console.log(err);
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
async function copyTemp(dir, dirName) {
  console.log(chalk.green('copy templage...'));
  console.log(chalk.green(`from ${dir}`));
  console.log(chalk.green(`to ${path.join(process.cwd(), dirName)}`));
  try {
    await copyDir(dir, process.cwd(), dirName);
  }
  catch (error) {
    return console.log(chalk.red(error));
  }
  console.log(chalk.green('copy finish'));
  // npm install
  console.log(chalk.blue('packages install ...'));
  if (os.platform() === 'win32') {
    shell.cd(dirName);
  } else {
    execSync(`cd ${dirName}`);
  }
  execSync(`npm install`);
  console.log(chalk.blue('packages installed'));
}

/**
 * 复制文件
 *
 * @param {String} from 源路径
 * @param {String} to 目标路径
 */
async function copyFile(from, to) {
  return new Promise(function (resolve, reject) {
    try {
      fs.createReadStream(from).pipe(fs.createWriteStream(to).on('close', function () {
        resolve();
      }));
    }
    catch (error) {
      reject(error);
    }
  });
}

/**
 * 复制文件夹
 *
 * @param {String} from 源路径
 * @param {String} to 目标路径
 * @param {String=} dirName 新文件夹名
 */
async function copyDir(from, to, dirName) {
  return new Promise(async function (resolve, reject) {
    try {
      // 创建文件夹
      if (dirName) {
        // 创建指定名称文件夹
        fs.mkdirSync(path.join(to, dirName));
      }
      else {
        // 创建默认名称文件夹
        fs.mkdirSync(path.join(to, path.basename(from)));
      }
      // 读取所有文件
      const files = fs.readdirSync(from);
      // 遍历文件
      await Promise.all(
        files.map(async function(file) {
          return new Promise(async function (resolve) {
            // 获取文件状态
            const info = fs.statSync(path.join(from, file));
            // 如果是文件夹递归调用
            if (info.isDirectory()) {
              await copyDir(path.join(from, file), path.join(to, dirName), file);
            }
            // 如果是文件直接复制
            else {
              await copyFile(path.join(from, file), path.join(to, dirName, file));
            }
            resolve();
          });
        })
      );
      resolve();
    }
    catch (error) {
      reject(error);
    }
  });
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
      console.log(chalk.blue('templage is not exists'));
      await getTemp(config.temp.url, config.temp.dir);
      resolve('ok');
    }
    console.log(chalk.blue('get templage suceess'));
    resolve('ok');
  });
}

/**
 * 判断文件是否存在
 *
 * @param {String} path 路径
 *
 * @return {Boolean} 文件状态
 */
function fileExists(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  copyTemp,
  copyDir,
  copyFile,
  checkTemp,
  fileExists,
};
