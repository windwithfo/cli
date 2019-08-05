/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path = require('path');
const Chalk = require('chalk');
const webpack = require('webpack');
const baseConfig = require('./base.react');
const merge = require('webpack-merge');
const Html = require('html-webpack-plugin');
const Linter = require('stylelint-webpack-plugin');
const formatter = require('eslint-friendly-formatter');
const ProgressBar = require('progress-bar-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const entry = require(process.cwd() + '/project.view');
const config = require(process.cwd() + '/project.config');

const createLintingRule = () => ({
  test: /\.js(x)?$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [path.resolve(process.cwd(), 'src')],
  options: {
    formatter: formatter,
    configFile: path.resolve(__dirname, '../lint/js.react.cfg.js'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
});

let webpackConfig = merge(baseConfig, {
  mode: 'development',
  output: {
    path: path.join(process.cwd(), config.pub.assetsRir),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[id].[hash].js',
    publicPath: config.dev.assetsPath
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      ...(config.dev.useEslint ? [createLintingRule()] : [])
    ]
  },
  devtool: '#eval-source-map',
  performance: {
    hints: false
  },
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPath, 'index.html') },
      ]
    },
    hot: true,
    // since we use CopyWebpackPlugin.
    contentBase: process.cwd(),
    compress: true,
    host: config.dev.host,
    port: config.dev.port,
    open: false,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPath,
    proxy: config.dev.proxyTable,
    // necessary for FriendlyErrorsPlugin
    quiet: true,
    watchOptions: {
      poll: config.dev.poll
    },
    before(app) {
      app.get('/env', function (req, res) {
        res.json({ env: 'dev' });
      });
    }
  },
  // 插件项
  plugins: [
    // webpack迁移插件
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrors(),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    ...(config.dev.useStylelint ? [new Linter({
      configFile: path.join(__dirname + '/../lint/style.cfg.js'),
      files: ['src/**/*.less', 'srcs/**/*.jsx'],
      ignorePath: 'node_modules/**',
      syntax: 'less'
    })] : [])
  ]
});

if (config.pub.analyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

for (const page in entry) {
  webpackConfig.plugins.push(
    new Html({
      filename: page + '.html',
      template: path.join(process.cwd(), 'temp', entry[page].template || 'html.ejs'),
      inject: true,
      excludeChunks: Object.keys(entry).filter(function (item) {
        return (item !== page);
      }),
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.dev.assetsPath + 'static/dll.vendor.js',
      },
    })
  );
}
// merge loader
if (config.dev.loaders.length>0) {
  config.dev.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    );
    webpackConfig.module.rules.push(item);
  })
}

if (config.dev.plugins.length>0) {
  config.dev.plugins.forEach(item => {
    webpackConfig.plugins.push(item);
  })
}

module.exports = webpackConfig;
