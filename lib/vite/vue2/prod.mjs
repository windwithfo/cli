/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                from 'path'
import { defineConfig }    from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import viteCompression     from 'vite-plugin-compression'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

export default defineConfig({
  plugins: [
    createVuePlugin(),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
      libs: [{
        libraryName: 'element-ui',
        esModule: true,
        ensureStyleFile: true,
        resolveStyle: (name) => {
          name = name.slice(3)
          return `element-ui/packages/theme-chalk/src/${name}.scss`
        },
        resolveComponent: (name) => {
          return `element-plus/lib/${name}`
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
