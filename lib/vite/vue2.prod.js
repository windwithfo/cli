/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const { createVuePlugin } = require('vite-plugin-vue2')
const path = require('path')
const { defineConfig } = require('vite')
const styleImport = require('vite-plugin-style-import').default
const viteCompression = require('vite-plugin-compression').default

module.exports = defineConfig({
  plugins: [
    createVuePlugin(),
    styleImport({
      libs: [{
        libraryName: 'element-ui',
        esModule: true,
        ensureStyleFile: true,
        resolveStyle: (name) => {
          name = name.slice(3)
          return `element-ui/packages/theme-chalk/src/${name}.scss`;
        },
        resolveComponent: (name) => {
          return `element-plus/lib/${name}`;
        },
      }]
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'component': path.resolve(__dirname, 'src/components'),
      'asset': path.resolve(__dirname, 'src/assets'),
      'view': path.resolve(__dirname, 'src/views'),
      'api': path.resolve(__dirname, 'src/api'),
      'common': path.resolve(__dirname, 'src/common'),
    },
  },
  build: {
    rollupOptions: {
      input: {}
    }
  },
})
