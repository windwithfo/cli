/**
 * @file 基础配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const entry = require(process.cwd() + '/project.view');
const config = require(process.cwd() + '/project.config');
const manifest = require(process.cwd() + '/static/vendor-manifest');

const entrys = {};
Object.keys(entry).forEach((item) => {
  entrys[item] = entry[item].path;
});

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
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css']
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.react$/]
            }
          }
        ]
      },
      {
        test: /\.js(x)?$/,
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
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'img/[name].[hash:7].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name].[hash:7].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest
    }),
    new CopyPlugin([{
      from: path.resolve(process.cwd(), 'static'),
      to: config.dev.subassetsRir,
      ignore: ['.*']
    }]),
  ]
};

module.exports = webpackConfig;
