#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const program = require('commander');
const DevServer = require('webpack-dev-server');

const { exec } = require('child_process');
const { Log } = require('../lib/utils');

program.usage('wc run');

program.on('--help', function() {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc run', 'white');
  Log('');
});

program.option('-n, --name', 'package name to run');
program.action(function (name) {
  if (typeof name === 'object') {
    // check project config exists
    if (!fs.pathExistsSync(path.join(process.cwd(), 'project.config.json'))
      && !fs.pathExistsSync(path.join(process.cwd(), 'project.config.js'))) {
      Log('missing config file: project.config, json or js', 'red');
      return;
    }
    const proCfg = require(path.join(process.cwd(), 'project.config'));

    // check dll exists
    if (fs.pathExistsSync(path.join(process.cwd(), 'static', 'vendor-manifest.json')) || !proCfg.dll || proCfg.dll.length === 0) {
      // run with dll
      run();
    }
    else {
      // init dll first
      dll();
    }
  }
  else {
    Log(`run in multi package is ${name}`);
    const workerProcess = exec('wc run', {
      cwd: path.join(process.cwd(), 'packages', name)
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

function run() {
  Log('run server');
  const proCfg = require(path.join(process.cwd(), 'project.config'));
  const config = proCfg.mode && proCfg.mode === 'local'
    ? require(path.join(process.cwd(), proCfg.localFolder, proCfg.dev.localFile))
    : require('../lib/webpack/dev.' + (proCfg.view || 'react') + (proCfg.libVersion || ''));
  // for hot reload
  DevServer.addDevServerEntrypoints(config, config.devServer);
  const compiler = webpack(config);
  // set params
  const server = new DevServer(compiler, config.devServer);
  // set port an host
  server.listen(process.env.PORT || proCfg.dev.port, proCfg.dev.host, () => {
    Log('******************************************************************', 'green');
    Log(`server is running on ${proCfg.dev.port} host is ${proCfg.dev.host}`, 'green');
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
    run();
  });
}
