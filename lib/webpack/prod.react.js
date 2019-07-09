/**
 * @file 部署配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const Chalk = require('chalk');
const webpack = require('webpack');
const baseConfig = require('./base.react');
const merge = require('webpack-merge');
const Html = require('html-webpack-plugin');
const UglifyJs = require('uglifyjs-webpack-plugin');
const Extract = require('mini-css-extract-plugin');
const ProgressBar = require('progress-bar-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const CSSAssets = require('optimize-css-assets-webpack-plugin');
const entry = require(process.cwd() + '/project.view.json');
const config = require(process.cwd() + '/project.config.json');

let webpackConfig = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJs({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new CSSAssets({})
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  output: {
    path: path.join(process.cwd(), config.pub.assetsRir),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
    publicPath: config.pub.assetsPath
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [Extract.loader, 'css-loader']
      },
      {
        test: /\.less$/,
        use: [Extract.loader, 'css-loader', 'less-loader']
      }
    ]
  },
  stats: {
    children: false,
    chunks: false,
    modules: false
  },
  // 插件项
  plugins: [
    // webpack迁移插件
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new CleanWebpackPlugin(),
    new FriendlyErrors(),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    new Extract({
      filename: 'css/app.[name].css',
      chunkFilename: 'css/app.[contenthash:12].css'
    })
  ]
});

for (const page in entry) {
  webpackConfig.plugins.push(
    new Html({
      filename: page + '.html',
      template: path.join(process.cwd(), 'temp', 'html.ejs'),
      inject: true,
      excludeChunks: Object.keys(entry).filter(function (item) {
        return (item !== page);
      }),
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.pub.assetsPath + 'static/dll.vendor.js',
      },
      chunksSortMode: 'dependency'
    })
  );
}

if (config.pub.analyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

if (config.pub.gzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + config.pub.gzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}
// merge loader
if (config.pub.loaders.length>0) {
  config.pub.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    );
    webpackConfig.module.rules.push(item);
  })
}

if (config.pub.plugins.length>0) {
  config.pub.plugins.forEach(item => {
    webpackConfig.plugins.push(item);
  })
}

module.exports = webpackConfig;
