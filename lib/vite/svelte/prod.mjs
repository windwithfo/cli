/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import { defineConfig }  from 'vite'
import { getProjectCfg } from '../../utils.mjs'
import viteCompression   from 'vite-plugin-compression'
import { svelte }        from '@sveltejs/vite-plugin-svelte'

const proCfg = await getProjectCfg()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: proCfg.vite.customElement || false,
      },
      experimental: {
        useVitePreprocess: true
      }
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  build: {
    rollupOptions: {
      input: {}
    }
  },
})
