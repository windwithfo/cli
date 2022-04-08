/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import { defineConfig }  from 'vite'
import { resolve }       from 'path'
import { libPath }       from '../../tools.js'
import eslintPlugin      from '@nabla/vite-plugin-eslint'
import StylelintPlugin   from 'vite-plugin-stylelint-serve'
import { svelte }        from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      experimental: {
        useVitePreprocess: true
      }
    }),
    eslintPlugin({
      eslintOptions: {
        fix: true,
        overrideConfigFile: resolve(libPath, 'lint/svelte.eslint.js')
      },
      shouldLint: (path) => path.match(/\/src\/[^?]*\.(svelte|m?[jt]sx?)$/)
    }),
    StylelintPlugin.default({
      fix: true,
      include: ['src/**/*.css', 'src/**/*.less', 'src/**/*.sass', 'src/**/*.styl', 'src/**/*.scss', 'src/**/*.svelte'],
      configFile: resolve(libPath, 'lint/svelte.style.js')
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
