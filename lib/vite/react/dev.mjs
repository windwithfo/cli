/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import { defineConfig } from 'vite'
import { libPath }      from '../../tools.js'
import vitePluginImp    from 'vite-plugin-imp'
import StylelintPlugin  from 'vite-plugin-stylelint-serve'
import reactRefresh     from '@vitejs/plugin-react-refresh'

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    reactRefresh(),
    vitePluginImp.default({
      onlyBuild: false,
      optimize: true,
      libList: [{
        libName: 'antd',
        libDirectory: 'es',
        style: (name) => `antd/es/${name}/style/index`
      }]
    }),
    StylelintPlugin.default({
      fix: true,
      include: ['src/**/*.css', 'src/**/*.less', 'src/**/*.sass', 'src/**/*.styl', 'src/**/*.scss'],
      configFile: path.resolve(libPath, 'lint/react.style.js')
    }),
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
