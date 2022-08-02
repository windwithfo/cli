/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import { defineConfig } from 'vite'
import { libPath }      from '../../tools.js'
import vitePluginImp    from 'vite-plugin-imp'
import react            from '@vitejs/plugin-react'
import eslintPlugin     from '@nabla/vite-plugin-eslint'
import StylelintPlugin  from 'vite-plugin-stylelint-serve'

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy']
        }
      }
    }),
    vitePluginImp({
      onlyBuild: false,
      optimize: true,
      libList: [{
        libName: 'antd',
        libDirectory: 'es',
        style: (name) => `antd/es/${name}/style/index`
      }]
    }),
    eslintPlugin({
      eslintOptions: {
        fix: true,
        overrideConfigFile: path.resolve(libPath, 'lint/react.eslint.js')
      },
      shouldLint: (path) => path.match(/\/src\/[^?]*\.([jt]s|[jt]sx)$/)
    }),
    StylelintPlugin({
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
