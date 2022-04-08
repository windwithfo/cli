/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path                    from 'path'
import { defineConfig }        from 'vite'
import { libPath }             from '../../tools.js'
import vue                     from '@vitejs/plugin-vue'
import AutoImport              from 'unplugin-auto-import/vite'
import eslintPlugin            from '@nabla/vite-plugin-eslint'
import StylelintPlugin         from 'vite-plugin-stylelint-serve'
import Components              from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    eslintPlugin({
      eslintOptions: {
        fix: true,
        overrideConfigFile: path.resolve(libPath, 'lint/vue.eslint.js')
      },
      shouldLint: (path) => path.match(/\/src\/[^?]*\.(vue|m?[jt]sx?)$/)
    }),
    StylelintPlugin.default({
      fix: true,
      include: ['src/**/*.css', 'src/**/*.less', 'src/**/*.sass', 'src/**/*.styl', 'src/**/*.scss', 'src/**/*.vue'],
      configFile: path.resolve(libPath, 'lint/vue.style.js')
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
