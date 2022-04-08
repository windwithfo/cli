/**
 * @file 部署配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                     from 'path'
import Chalk                    from 'chalk'
import webpack                  from 'webpack'
import fs                       from 'fs-extra'
import { merge }                from 'webpack-merge'
import baseConfig               from '../base.vue.mjs'
import { getProjectCfg }        from '../../utils.mjs'
import Html                     from 'html-webpack-plugin'
import CopyPlugin               from 'copy-webpack-plugin'
import { CleanWebpackPlugin }   from 'clean-webpack-plugin'
import TerserJs                 from 'terser-webpack-plugin'
import Extract                  from 'mini-css-extract-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CompressionWebpackPlugin from 'compression-webpack-plugin'
import ProgressBar              from 'progress-bar-webpack-plugin'
import FriendlyErrors           from 'friendly-errors-webpack-plugin'
import CSSAssets                from 'optimize-css-assets-webpack-plugin'

const config = await getProjectCfg()
const { VueLoaderPlugin } = (await import(`${process.cwd()}/node_modules/vue-loader/lib/index.js`)).default

let manifest
try {
  manifest = fs.readJSONSync(process.cwd() + `/${config.webpack.subassetsRir}/vendor-manifest.json`)
} catch (error) {
  console.log('no dll json')
}

const entry = config.webpack.view

const webpackConfig = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserJs({
        parallel: true,
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
      chunks: [page],
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.webpack.dev.assetsPath + `dll.vendor.js`,
        globalBarHide: entry[page].globalBarHide || false,
        checkoutLogin: entry[page].checkoutLogin || false,
        prodHide: entry[page].prodHide || false,
        redirect: entry[page].redirect || false,
      }
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
      to: file
    })
  })
}
copy.push({
  from: path.resolve(process.cwd(), config.webpack.subassetsRir),
  to: '.'
})
webpackConfig.plugins.push(new CopyPlugin({
  patterns: copy
}))

if (config.webpack.pub.analyzerReport) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

if (config.webpack.pub.gzip) {
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      test: new RegExp(
        '\\.(' + config.webpack.pub.gzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8,
      exclude: /\.?dll\./i
    })
  )
}
// merge loader
if (config.webpack.pub.loaders.length > 0) {
  config.webpack.pub.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    )
    webpackConfig.module.rules.push(item)
  })
}

if (config.webpack.pub.plugins.length > 0) {
  config.webpack.pub.plugins.forEach(item => {
    webpackConfig.plugins.push(item)
  })
}

export default webpackConfig
