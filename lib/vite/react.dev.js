/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const reactRefresh = require('@vitejs/plugin-react-refresh')
const path = require('path')
const { defineConfig } = require('vite')
const styleImport = require('vite-plugin-style-import').default

module.exports = defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    reactRefresh(),
    styleImport({
      libs: [{
        libraryName: 'antd',
        esModule: true,
        resolveStyle: (name) => {
          return `antd/es/${name}/style/index`;
        },
      }]
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
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
