/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path              from 'path'
import Chalk             from 'chalk'
import webpack           from 'webpack'
import { getProjectCfg } from '../../utils.mjs'
import Compression       from 'compression-webpack-plugin'
import ProgressBar       from 'progress-bar-webpack-plugin'
import FriendlyErrors    from 'friendly-errors-webpack-plugin'

const config = await getProjectCfg()

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
      test: /\.js(\?.*)?$/i,
      threshold: 10240,
      minRatio: 0.8
    }),
  ]
}

export default webpackConfig
