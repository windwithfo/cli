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
  devtool: 'cheap-module-source-map',
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm-browser.prod.js',
      vuex$: 'vuex/dist/vuex.esm-browser.prod.js',
      'vue-router$': 'vue-router/dist/vue-router.esm-browser.js'
    },
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
    })
  ]
}

module.exports = webpackConfig
