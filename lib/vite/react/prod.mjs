/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path             from 'path'
import { defineConfig } from 'vite'
import vitePluginImp    from 'vite-plugin-imp'
import react            from '@vitejs/plugin-react'
import viteCompression  from 'vite-plugin-compression'

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
    {
      postcssPlugin: 'internal:charset-removal',
      AtRule: {
        charset: (atRule) => {
          if (atRule.name === 'charset') {
            atRule.remove();
          }
        }
      }
    },
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
      '@': path.resolve(process.cwd(), 'src'),
      'component': path.resolve(process.cwd(), 'src/components'),
      'asset': path.resolve(process.cwd(), 'src/assets'),
      'view': path.resolve(process.cwd(), 'src/views'),
      'api': path.resolve(process.cwd(), 'src/api'),
      'common': path.resolve(process.cwd(), 'src/common'),
    },
  },
  build: {
    rollupOptions: {
      input: {}
    }
  },
})
