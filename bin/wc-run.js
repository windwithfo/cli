#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(dongkunshan@gaosiedu.com)
 */

const webpack = require('webpack');
const program = require('commander');
const DevServer = require('webpack-dev-server');

const { Log, fileExists } = require('../lib/utils');

program.usage('wc run');

program.on('--help', function() {
  Log('');
  Log('  Examples:', 'white');
  Log('');
  Log('    $ wc run', 'white');
  Log('');
});

program.parse(process.argv);

// check project config exists
if (!fileExists(process.cwd() + '/project.config.json')) {
  Log('missing config file: project.config.json', 'red');
  return;
}
const proCfg = require(process.cwd() + '/project.config.json');

// check dll exists
if (fileExists(process.cwd() + '/static/vendor-manifest.json') || !proCfg.dll || proCfg.dll.length === 0) {
  // run with dll
  run();
}
else {
  // init dll first
  dll();
}

function run() {
  Log('run server');
  const config = require('../lib/webpack/dev.' + (proCfg.view || 'react'));
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
  Log('config file is: ' + process.cwd() + '/project.config.json', 'green');
  if (!fileExists(process.cwd() + '/project.config.json')) {
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
    run();
  });
}
