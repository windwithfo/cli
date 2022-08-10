/**
 * @file 基础配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path              from 'path'
import { getProjectCfg } from '../utils.mjs'

const config = await getProjectCfg()

const entry = config.webpack.view
const entrys = {}
Object.keys(entry).forEach((item) => {
  entrys[item] = entry[item].path
})

const webpackConfig = {
  entry: entrys,
  resolve: {
    modules: [
      'node_modules',
      process.cwd() + '/node_modules'
    ],
    alias: {
      '@': process.cwd() + '/src',
      component: process.cwd() + '/src/components',
      asset: process.cwd() + '/src/assets',
      view: process.cwd() + '/src/views'
    },
    extensions: ['.js', '.mjs', '.ts', '.vue', '.json', '.less', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: 'pug-plain-loader'
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader'
          },
        ],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'vue-html-loader'
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: {
          loader: 'json-loader'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset/resource'
      },
      {
        test: /\.(wav|ogg|mp3)(\?.*)?$/,
        type: 'asset/resource'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource'
      }
    ]
  },
}

if (config.alias) {
  Object.keys(config.alias).forEach((item) => {
    webpackConfig.resolve.alias[item] = path.resolve(process.cwd(), config.alias[item])
  })
}

export default webpackConfig
