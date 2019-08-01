#!/usr/bin/env node
/**
 * @file 发布项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const webpack = require('webpack');
const program = require('commander');

const { exec } = require('child_process');
const { Log, fileExists } = require('../lib/utils');

program.usage('wc pub');

program.on('--help', function() {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc pub', 'white');
  Log('');
});

program.option('-n, --name', 'package name to pub');
program.action(function (name) {
  if (typeof name === 'object') {
    const proCfg = require(path.join(process.cwd(), 'project.config.json'));
    // check dll exists
    if (fileExists(path.join(process.cwd(), 'static', 'vendor-manifest.json')) || !proCfg.dll || proCfg.dll.length === 0) {
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
  if (!fileExists(path.join(process.cwd(), 'project.config.json'))) {
    Log('missing config file: project.config.json', 'red');
    return;
  }
  const proCfg = require(path.join(process.cwd(), 'project.config.json'));
  const config = proCfg.mode && proCfg.mode === 'local'
    ? require(path.join(process.cwd(), proCfg.localFolder, proCfg.pub.localFile))
    : require('../lib/webpack/prod.' + (proCfg.view || 'react'));
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
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
  Log(`config file is: ${path.join(process.cwd(), 'project.config.json')}`, 'green');
  if (!fileExists(path.join(process.cwd(), 'project.config.json'))) {
    Log('missing config file: project.config.json', 'red');
    return;
  }
  const config = require('../lib/webpack/dll');
  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
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
