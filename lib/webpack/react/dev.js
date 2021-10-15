/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path           = require('path')
const Chalk          = require('chalk')
const webpack        = require('webpack')
const baseConfig     = require('../base.react')
const { merge }      = require('webpack-merge')
const Html           = require('html-webpack-plugin')
const CopyPlugin     = require('copy-webpack-plugin')
const Linter         = require('stylelint-webpack-plugin')
const formatter      = require('eslint-friendly-formatter')
const ProgressBar    = require('progress-bar-webpack-plugin')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const config         = require(process.cwd() + '/project.config')

let manifest
try {  
   manifest = require(process.cwd() + `/${config.webpack.subassetsRir}/vendor-manifest.dev.json`)
} catch (error) {
  console.log('no dll json')
}

const entry = config.webpack.view

const createLintingRule = () => ({
  test: /\.(j|t)s(x)?$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [path.resolve(process.cwd(), 'src')],
  options: {
    formatter: formatter,
    configFile: path.resolve(__dirname, '../../lint/react.cfg.js'),
    emitWarning: !config.webpack.dev.showEslintErrorsInOverlay
  }
})

const webpackConfig = merge(baseConfig, {
  mode: 'development',
  output: {
    path: path.join(process.cwd(), config.webpack.pub.assetsRir),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[id].[hash].js',
    publicPath: config.webpack.dev.assetsPath
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', {
          loader: 'less-loader',
          options: {
              javascriptEnabled: true
          }
      }]
      },
      ...(config.webpack.dev.useEslint ? [createLintingRule()] : [])
    ]
  },
  devtool: config.webpack.dev.devtool || 'cheap-module-eval-source-map',
  performance: {
    hints: false
  },
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.webpack.dev.assetsPath, 'index.html') },
      ]
    },
    hot: true,
    // since we use CopyWebpackPlugin.
    contentBase: process.cwd(),
    compress: true,
    host: config.webpack.dev.host,
    port: config.webpack.dev.port,
    open: false,
    overlay: config.webpack.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.webpack.dev.assetsPath,
    proxy: config.webpack.dev.proxyTable,
    // necessary for FriendlyErrorsPlugin
    quiet: true,
    watchOptions: {
      poll: config.webpack.dev.poll
    },
    before(app) {
      app.get('/env', function (req, res) {
        res.json({ env: 'dev' })
      })
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
    ...(config.webpack.dev.useStylelint ? [new Linter({
      configFile: path.join(__dirname + '/../../lint/style.cfg.js'),
      files: [`src/**/*.${config.webpack.dev.lintStyle || 'scss'}`, 'src/**/*.jsx'],
      ignorePath: 'node_modules/**',
      syntax: config.webpack.dev.lintStyle || 'scss'
    })] : []),
    ...(manifest ? [new webpack.DllReferencePlugin({
      manifest
    })] : []),
  ]
})

if (config.webpack.sassResources && config.webpack.sassResources.length > 0) {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader', {
      loader: 'sass-resources-loader',
      options: {
        resources: [...config.webpack.sassResources]
      }
    }]
  })
} else {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
  })
}

if (config.webpack.dev.copy && config.webpack.dev.copy.length > 0) {
  const copy = []
  config.webpack.pub.copy.forEach((file) => {
    copy.push({
      from: path.resolve(process.cwd(), file),
      to: file,
      ignore: ['.*']
    })
  })
  webpackConfig.plugins.push(new CopyPlugin(copy))
}

if (config.webpack.pub.analyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

for (const page in entry) {
  webpackConfig.plugins.push(
    new Html({
      filename: page + '.html',
      template: path.join(process.cwd(), entry[page].template || 'html.ejs'),
      inject: true,
      chunks: [page],
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.webpack.dev.assetsPath + `${config.webpack.subassetsRir}/dll.vendor.dev.js`,
      },
    })
  )
}
// merge loader
if (config.webpack.dev.loaders.length > 0) {
  config.webpack.dev.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    )
    webpackConfig.webpack.module.rules.push(item)
  })
}

if (config.webpack.dev.plugins.length > 0) {
  config.webpack.dev.plugins.forEach(item => {
    webpackConfig.webpack.plugins.push(item)
  })
}

module.exports = webpackConfig
