/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const { createVuePlugin } = require('vite-plugin-vue2')
const path = require('path')
const { defineConfig } = require('vite')
const styleImport = require('vite-plugin-style-import').default

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
          return `element-ui/lib/${name}`;
        },
      }]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      'component': path.resolve(process.cwd(), 'src/components'),
      'asset': path.resolve(process.cwd(), 'src/assets'),
      'view': path.resolve(process.cwd(), 'src/views'),
      'api': path.resolve(process.cwd(), 'src/api'),
      'common': path.resolve(process.cwd(), 'src/common'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
