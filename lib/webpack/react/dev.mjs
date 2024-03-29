/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                     from 'path'
import Chalk                    from 'chalk'
import webpack                  from 'webpack'
import fs                       from 'fs-extra'
import { merge }                from 'webpack-merge'
import { libPath }              from '../../tools.js'
import { getProjectCfg }        from '../../utils.mjs'
import baseConfig               from '../base.react.mjs'
import Html                     from 'html-webpack-plugin'
import CopyPlugin               from 'copy-webpack-plugin'
import ESLintPlugin             from 'eslint-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import Linter                   from 'stylelint-webpack-plugin'
import ProgressBar              from 'progress-bar-webpack-plugin'
import FriendlyErrors           from 'friendly-errors-webpack-plugin'

const config = await getProjectCfg()

let manifest
try {
   manifest = fs.readJSONSync(process.cwd() + `/${config.webpack.subassetsRir}/vendor-manifest.dev.json`)
} catch (error) {
  console.log('no dll json')
}

const entry = config.webpack.view

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
            lessOptions: {
              javascriptEnabled: true
            }
          }
        }]
      },
    ]
  },
  devtool: config.webpack.dev.devtool || 'cheap-module-eval-source-map',
  performance: {
    hints: false
  },
  stats: 'none',
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.webpack.dev.assetsPath, 'index.html') },
      ]
    },
    static: ['public', 'static'],
    client: {
      logging: 'none',
      overlay: false,
      progress: false,
      webSocketURL: {
        hostname: "0.0.0.0",
        pathname: "/ws",
        port: config.webpack.dev.port,
      },
    },
    allowedHosts: 'all',
    devMiddleware: {
      publicPath: config.webpack.dev.assetsPath
    },
    hot: true,
    compress: true,
    host: config.webpack.dev.host,
    port: config.webpack.dev.port,
    open: false,
    proxy: config.webpack.dev.proxyTable,
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app.get('/env', function (req, res) {
        res.json({ env: 'dev' })
      })
    }
  },
  // 插件项
  plugins: [
    // webpack迁移插件
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrors(),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    ...(config.webpack.dev.useStylelint ? [new Linter({
      configFile: path.resolve(libPath, 'lint', 'react.style.js'),
      files: ['src/**/*.scss'],
      ignorePath: 'node_modules/**',
      fix: true
    })] : []),
    ...(config.webpack.dev.useEslint ? [new ESLintPlugin({
      extensions: ['js', 'ts', 'jsx', 'tsx'],
      files: [path.resolve(process.cwd(), 'src')],
      fix: true,
      overrideConfigFile: path.resolve(libPath, 'lint', 'react.eslint.js'),
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
      to: file
    })
  })
  webpackConfig.plugins.push(new CopyPlugin({
    patterns: copy
  }))
}

if (config.webpack.dev.analyzerReport) {
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
        vendor: config.webpack.dev.assetsPath + 'dll.vendor.dev.js',
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

export default webpackConfig
