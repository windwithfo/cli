/**
 * @file 项目全局配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

 const { resolve } = require('path')

module.exports = {
  view: 'vue3',
  ssr: false,
  build: 'webpack',
  lint: {
    autoFix: true,
    root: 'src',
    ext: ['.js', 'ts'],
    ignore: ['assets'],
  },
  server: {
     port: 8080,
     proxy: {
       // 如果是 /api 打头，则访问地址如下
       '/api': {
         target: 'https://www.baidu.com',
         changeOrigin: true,
         rewrite: path => path.replace(/^\/api/, '')
       },
     },
  },
  vite: {
     copy: [
       {
         from: 'project.config.js',
         to: 'dist/project.config.js'
       }
     ],
     server: {
       port: 8080,
       proxy: {
         // 如果是 /api 打头，则访问地址如下
         '/api': {
           target: 'https://www.baidu.com',
           changeOrigin: true,
           rewrite: path => path.replace(/^\/api/, '')
         },
       },
     },
     build: {
       rollupOptions: {
         input: {
           index: resolve(__dirname, 'html/index.html'),
           list: resolve(__dirname, 'html/list.html')
         },
       }
     },
  },
  webpack: {
     dll: ['vue', 'vuex', 'vue-router', 'axios'],
     view: {
       index: {
         template: 'temp/html.ejs',
         show: true,
         path: 'view/index/index',
         title: 'home',
         meta: {
           keywords: 'home',
           description: 'home',
           viewport: 'initial-scale=1, maximum-scale=1',
           'format-detection': 'telephone=no',
           'format-detection': 'email=no'
         }
       },
       list: {
         template: 'temp/html.ejs',
         show: true,
         path: 'view/list/index',
         title: 'list',
         meta: {
           keywords: 'list',
           description: 'list'
         }
       },
     },
     subassetsRir: 'static',
     pub: {
       assetsRir: 'dist',
       assetsPath: '/',
       sourceMap: false,
       devtool: 'source-map',
       gzip: true,
       gzipExtensions: ['js', 'css'],
       analyzerReport: false,
       loaders: [],
       plugins: [],
       copy: ['project.config.js'],
     },
     dev: {
       assetsPath: '/',
       proxyTable: {
        '/api': {
          target: 'https://www.baidu.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
       },
       host: '0.0.0.0',
       port: 8088,
       autoOpenBrowser: false,
       errorOverlay: true,
       notifyOnErrors: true,
       poll: false,
       useEslint: true,
       useStylelint: true,
       lintStyle: 'scss',
       showEslintErrorsInOverlay: false,
       devtool: 'cheap-module-source-map',
       cacheBusting: true,
       cssSourceMap: true,
       loaders: [],
       plugins: [],
     }
  },
} 
 