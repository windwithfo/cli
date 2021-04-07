/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const Chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress-bar-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const config = require(process.cwd() + '/project.config');

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
    alias: {
      vue$: 'vue/dist/vue.runtime.esm-browser.js'
    },
    extensions: ['.js', '.ts', '.json', '.less', '.css']
  },
  output: {
    path: process.cwd() + '/static',
    filename: 'dll.[name].js',
    library: '[name]'
  },
  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(true)
    }),
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
