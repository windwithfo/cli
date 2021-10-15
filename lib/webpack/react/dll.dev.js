/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path           = require('path')
const Chalk          = require('chalk')
const webpack        = require('webpack')
const Compression    = require('compression-webpack-plugin')
const ProgressBar    = require('progress-bar-webpack-plugin')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const config         = require(process.cwd() + '/project.config')

const webpackConfig = {
  mode: 'development',
  entry: {
    vendor: config.webpack.dll
  },
  resolve: {
    modules: [
      'node_modules',
      process.cwd() + '/node_modules'
    ],
    extensions: ['.js', '.ts', '.json', '.less', '.css']
  },
  output: {
    path: path.join(process.cwd(), config.webpack.subassetsRir || 'static'),
    filename: 'dll.[name].dev.js',
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
      path: path.join(process.cwd(), config.webpack.subassetsRir || 'static', '[name]-manifest.dev.json'),
      name: '[name]'
    }),
    new Compression({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.js$'
      ),
      threshold: 10240,
      minRatio: 0.8
    }),
  ]
}

module.exports = webpackConfig
