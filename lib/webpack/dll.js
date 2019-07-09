/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const Chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress-bar-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const config = require(process.cwd() + '/project.config.json');

const webpackConfig = {
  mode: 'production',
  entry: {
    vendor: config.dll
  },
  resolve: {
    modules: [
      'node_modules',
      process.cwd() + '/node_modules'
    ],
    extensions: ['.js', '.ts', '.json', '.less', '.css']
  },
  output: {
    path: process.cwd() + '/static',
    filename: 'dll.[name].js',
    library: '[name]'
  },
  plugins: [
    new FriendlyErrors(),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    new webpack.DllPlugin({
      path: path.join(process.cwd(), 'static', '[name]-manifest.json'),
      name: '[name]'
    })
  ]
};

module.exports = webpackConfig;
