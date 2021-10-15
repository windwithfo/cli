/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const { defineConfig } = require('vite')
const { svelte }       = require('@sveltejs/vite-plugin-svelte')
const viteCompression  = require('vite-plugin-compression').default

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [
    svelte(),
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
