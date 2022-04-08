/**
 * @file 开发配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                     from 'path'
import Chalk                    from 'chalk'
import webpack                  from 'webpack'
import fs                       from 'fs-extra'
import { VueLoaderPlugin }      from 'vue-loader'
import { merge }                from 'webpack-merge'
import { libPath }              from '../../tools.js'
import { getProjectCfg }        from '../../utils.mjs'
import baseConfig               from '../base.vue.mjs'
import Html                     from 'html-webpack-plugin'
import CopyPlugin               from 'copy-webpack-plugin'
import ESLintPlugin             from 'eslint-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import Linter                   from 'stylelint-webpack-plugin'
import ProgressBar              from 'progress-bar-webpack-plugin'
import AutoImport               from 'unplugin-auto-import/webpack'
import FriendlyErrors           from 'friendly-errors-webpack-plugin'
import Components               from 'unplugin-vue-components/webpack'
import { ElementPlusResolver }  from 'unplugin-vue-components/resolvers'

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
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
    publicPath: config.webpack.dev.assetsPath
  },
  resolve: {
    alias: {
      '@': process.cwd() + '/src',
      component: process.cwd() + '/src/components',
      asset: process.cwd() + '/src/assets',
      view: process.cwd() + '/src/views',
      vue$: 'vue/dist/vue.runtime.esm-browser.js'
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        resolve: {
          fullySpecified: false
        },
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
    ]
  },
  devtool: config.webpack.dev.devtool || 'cheap-module-eval-source-map',
  performance: {
    hints: false
  },stats: 'none',
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
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      DEV: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
      __VUE_PROD_API__: JSON.stringify(true),
    }),
    new ProgressBar({
      complete: Chalk.green('█'),
      incomplete: Chalk.white('█'),
      format: '  :bar ' + Chalk.green.bold(':percent') + ' :msg',
      clear: false
    }),
    ...(config.webpack.dev.useStylelint ? [new Linter({
      configFile: path.resolve(libPath, 'lint', 'vue.style.js'),
      files: ['src/**/*.scss}', 'src/**/*.vue'],
      ignorePath: 'node_modules/**'
    })] : []),
    ...(config.webpack.dev.useEslint ? [new ESLintPlugin({
      extensions: ['js', 'ts', 'vue'],
      files: [path.resolve(process.cwd(), 'src')],
      fix: true,
      overrideConfigFile: path.resolve(libPath, 'lint', 'vue.eslint.js'),
    })] : []),
    ...(manifest ? [new webpack.DllReferencePlugin({
      manifest
    })] : []),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ]
})

if (config.webpack.sassResources && config.webpack.sassResources.length > 0) {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader', {
      loader: 'sass-resources-loader',
      options: {
        resources: [...config.webpack.sassResources]
      }
    }]
  })
} else {
  webpackConfig.module.rules.push({
    test: /\.s(a|c)ss$/,
    use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
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
      excludeChunks: Object.keys(entry).filter(function (item) {
        return (item !== page)
      }),
      meta: entry[page].meta,
      templateParameters: {
        title: entry[page].title || '',
        vendor: config.webpack.dev.assetsPath + 'dll.vendor.dev.js',
        globalBarHide: entry[page].globalBarHide || false,
        checkoutLogin: entry[page].checkoutLogin || false,
        prodHide: entry[page].prodHide || false,
        redirect: entry[page].redirect || false,
      },
    })
  )
}

// merge loader
if (config.webpack.dev.loaders && config.webpack.dev.loaders.length > 0) {
  config.webpack.dev.loaders.forEach(item => {
    item.test = new RegExp(
      '\\.(' + item.test.join('|') + ')$'
    )
    webpackConfig.module.rules.push(item)
  })
}

if (config.webpack.dev.plugins && config.webpack.dev.plugins.length > 0) {
  config.webpack.dev.plugins.forEach(item => {
    webpackConfig.plugins.push(item)
  })
}

export default webpackConfig
