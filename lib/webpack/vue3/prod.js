/**
 * @file 部署配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

const path                   = require('path')
const Chalk                  = require('chalk')
const webpack                = require('webpack')
const baseConfig             = require('../base.vue')
const { merge }              = require('webpack-merge')
const Html                   = require('html-webpack-plugin')
const CopyPlugin             = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserJs               = require('terser-webpack-plugin')
const Extract                = require('mini-css-extract-plugin')
const ProgressBar            = require('progress-bar-webpack-plugin')
const FriendlyErrors         = require('friendly-errors-webpack-plugin')
const config                 = require(process.cwd() + '/project.config')
const CSSAssets              = require('optimize-css-assets-webpack-plugin')
const { VueLoaderPlugin }    = require(process.cwd() + '/node_modules/vue-loader')

let manifest
try {
  manifest = require(process.cwd() + `/${config.webpack.subassetsRir}/vendor-manifest`)
} catch (error) {
  console.log('no dll json')
}

const entry = config.webpack.view

const webpackConfig = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserJs({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new CSSAssets({})
    ],
    // splitChunks: {
    //   cacheGroups: {
    //     styles: {
    //       name: 'styles',
    //       test: /\.css$/,
    //       chunks: 'all',
    //       enforce: true
    //     }
    //   }
    // }
  },
  output: {
    path: path.join(process.cwd(), config.webpack.pub.assetsRir),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
    publicPath: config.webpack.pub.assetsPath
  },
  resolve: {
    alias: {
      '@': process.cwd() + '/src',
      component: process.cwd() + '/src/components',
      asset: process.cwd() + '/src/assets',
      view: process.cwd() + '/src/views',
      vue$: 'vue/dist/vue.runtime.esm-browser.prod.js'
    },
  },
  devtool: config.webpack.pub.devtool || 'source-map',
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [Extract.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: [Extract.loader, 'css-loader', 'postcss-loader', 'less-loader'],
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
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      DEV: JSON.stringify(false),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
      __VUE_PROD_API__: JSON.stringify(true),
    }),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    new Extract({
      filename: 'css/app.[name].css',
      chunkFilename: 'css/app.[contenthash:12].css'
    }),
    ...(manifest ? [new webpack.DllReferencePlugin({
      manifest
    })] : []),
  ]
})

for (const page in entry) {
  webpackConfig.plugins.push(
    new Html({
      filename: page + '.html',
      template: path.join(process.cwd(), entry[page].template || 'html.ejs'),
      inject: true,
      excludeChunks: Object.keys(entry).filter(function (item) {
        return (item !== page)
      }),
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.webpack.dev.assetsPath + `${config.webpack.subassetsRir}/dll.vendor.js`,
        globalBarHide: entry[page].globalBarHide || false,
        checkoutLogin: entry[page].checkoutLogin || false,
        prodHide: entry[page].prodHide || false,
        redirect: entry[page].redirect || false,
      },
      chunksSortMode: 'dependency'
    })
  )
}

if (config.webpack.sassResources && config.webpack.sassResources.length > 0) {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: [Extract.loader, 'css-loader', 'postcss-loader', 'sass-loader', {
      loader: 'sass-resources-loader',
      options: {
        resources: [...config.webpack.sassResources]
      }
    }]
  })
} else {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: [Extract.loader, 'css-loader', 'postcss-loader', 'sass-loader']
  })
}

const copy = []
if (config.webpack.pub.copy && config.webpack.pub.copy.length > 0) {
  config.webpack.pub.copy.forEach((file) => {
    copy.push({
      from: path.resolve(process.cwd(), file),
      to: file,
      ignore: ['.*']
    })
  })
}
copy.push({
  from: path.resolve(process.cwd(), config.webpack.subassetsRir),
  to: config.webpack.subassetsRir,
  ignore: ['mock/**']
})
webpackConfig.plugins.push(new CopyPlugin(copy))

if (config.webpack.pub.analyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

if (config.webpack.pub.gzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path][base].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + config.webpack.pub.gzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}
// merge loader
if (config.webpack.pub.loaders && config.webpack.pub.loaders.length > 0) {
  config.webpack.pub.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    )
    webpackConfig.module.rules.push(item)
  })
}

if (config.webpack.pub.plugins && config.webpack.pub.plugins.length > 0) {
  config.webpack.pub.plugins.forEach(item => {
    webpackConfig.plugins.push(item)
  })
}

module.exports = webpackConfig
