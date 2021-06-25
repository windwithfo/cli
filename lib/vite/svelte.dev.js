/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

const { svelte } = require('@sveltejs/vite-plugin-svelte')
const { defineConfig } = require('vite')

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
