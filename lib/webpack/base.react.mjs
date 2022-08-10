/**
 * @file 基础配置
 * @author dongkunshan(windwithfo@yeah.net)
 */
import { getProjectCfg } from '../utils.mjs'

const config = await getProjectCfg()

const entrys = {}
const entry = config.webpack.view
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
      '~': process.cwd() + '/src',
      component: process.cwd() + '/src/components',
      asset: process.cwd() + '/src/assets',
      view: process.cwd() + '/src/views'
    },
    extensions: ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader'
          },
        ],
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        use: {
          loader: 'json'
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

export default webpackConfig
