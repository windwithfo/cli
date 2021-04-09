#!/usr/bin/env node
/**
 * @file 发布项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const program = require('commander');

const { exec } = require('child_process');
const { Log } = require('../lib/utils');

program.usage('wc pub');

program.on('--help', function () {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc pub', 'white');
  Log('');
});

program.option('-n, --name', 'package name to pub');
program.action(function (name) {
  if (typeof name === 'object') {
    const proCfg = require(path.join(process.cwd(), 'project.config'));
    // check dll exists
    if (fs.pathExistsSync(path.join(process.cwd(), 'static', 'vendor-manifest.json')) || !proCfg.dll || proCfg.dll.length === 0) {
      // run with dll
      pub();
    }
    else {
      // init dll first
      dll();
    }
  }
  else {
    Log(`pub in multi package is ${name}`);
    const workerProcess = exec('wc pub', {
      cwd: path.join(process.cwd(), 'packages', name)
    }, function () {
      exec(`rm -rf dist/${name} && mv packages/${name}/dist dist/${name}`)
    });
    workerProcess.stdout.on('data', function (data) {
      Log(data, 'green');
    });

    workerProcess.stderr.on('data', function (data) {
      Log(data, 'red');
    });
  }
});

program.parse(process.argv);

function pub() {
  Log('build project');
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.json'))
    && !fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config, json or js', 'red');
    return;
  }
  const proCfg = require(path.join(process.cwd(), 'project.config'));
  const config = proCfg.mode && proCfg.mode === 'local'
    ? require(path.join(process.cwd(), proCfg.localFolder, proCfg.pub.localFile))
    : require('../lib/webpack/prod.' + (proCfg.view || 'react') + (proCfg.libVersion || ''));
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      Log(err, 'red');
      Log(stats, 'red');
      Log('build error', 'red');
      return;
    }
    Log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }), 'green');
    // Done processing
    Log('******************************************************************', 'green');
    Log('                       build successfully', 'green');
    Log('******************************************************************', 'green');
  });
}

function dll() {
  Log('init dll');
  Log(`config file is: ${path.join(process.cwd(), 'project.config')}`, 'green');
  if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.json'))
    && !fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
    Log('missing config file: project.config, json or js', 'red');
    return;
  }
  const proCfg = require(path.join(process.cwd(), 'project.config'));
  const config = require('../lib/webpack/dll.prod' + (proCfg.libVersion || ''));
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      Log(err, 'red');
      Log(stats, 'red');
      Log('dll install error', 'red');
      return;
    }
    // Done processing
    Log(stats.toString({
      // Add console colors
      colors: true,
      children: false,
      chunks: false,
      modules: false
    }), 'green');
    Log('dll installed');
    pub();
  });
}
