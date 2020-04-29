/**
 * @file 基础配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const webpack = require('webpack');
const entry = require(process.cwd() + '/project.view');
const config = require(process.cwd() + '/project.config');
const packageJson = require(path.join(process.cwd(), '/package.json'));
const manifest = require(path.join(process.cwd(), '/static/vendor-manifest'));

// 判断是否使用15版本之前的vue-loader
const vueLoader = packageJson.devDependencies['vue-loader'] || packageJson.dependencies['vue-loader'];
const vueLoaderVersion = vueLoader && vueLoader.slice(1).split('.')[0];
const isOld = vueLoaderVersion < 15;
// if (isOld && vueLoaderVersion < 11) {
//   throw (new Error("Please upgrade your vue-loader version to V11 or above! Use 'npm install vue-loader@11 --save-dev'"));
// }
// console.log('isOld:' + isOld);

const { VueLoaderPlugin } = require(process.cwd() + '/node_modules/vue-loader');

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
      '@': process.cwd() + '/src',
      component: process.cwd() + '/src/components',
      asset: process.cwd() + '/src/assets',
      view: process.cwd() + '/src/views'
    },
    extensions: ['.js', '.ts', '.vue', '.json', '.less', '.css']
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
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/]
            }
          }
        ]
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
        exclude: /node_modules/,
        options: {
          loaders:
            {
              pug: 'pug-plain-loader',
              ts: [
                {
                  loader: 'babel-loader'
                },
                {
                  loader: 'ts-loader',
                  options: {
                    appendTsSuffixTo: [/\.vue$/]
                  }
                }
              ],
              js: [
                {
                  loader: 'babel-loader'
                }
              ]
            }
        }
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
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'img/[name].[hash:7].[ext]'
          }
        }
      },
      {
        test: /\.(wav|ogg|mp3)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'audio/[name].[hash:7].[ext]'
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
    })
  ]
};

if (!isOld) {
  webpackConfig.plugins.push(new VueLoaderPlugin());
  webpackConfig.module.rules.find((v) => v.loader === 'vue-loader').options = {};
}

if (config.alias) {
  Object.keys(config.alias).forEach((item) => {
    webpackConfig.resolve.alias[item] = path.resolve(process.cwd(), config.alias[item]);
  });
}

module.exports = webpackConfig;
