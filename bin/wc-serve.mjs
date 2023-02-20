#!/usr/bin/env node
/**
 * @file 运行项目命令集合
 * @author dongkunshan(windwithfo@yeah.net)
 */
import Koa                    from 'koa'
import path                   from 'path'
import fs                     from 'fs-extra'
import { program }            from 'commander'
import kstatic                from 'koa-static'
import proxy                  from 'koa-proxies'
import { Log, getProjectCfg } from '../lib/utils.mjs'
import { historyApiFallback } from 'koa2-connect-history-api-fallback'
 
program.usage('wc serve')
 
program.on('--help', function () {
  Log('')
  Log('  Examples:', 'white')
  Log('')
  Log('    $ wc serve', 'white')
  Log('    $ wc serve -p 5000', 'white')
  Log('    $ wc serve --port 5000', 'white')
  Log('')
})
 
program.option('-p, --port <port>', 'port to run server')
program.action(async function (args) {
  const app = new Koa()
  const config = {
    server: {
      port: args.port || 8088,
      host: '0.0.0.0'
    }
  }
  let proCfg
  if (fs.pathExistsSync(path.join(process.cwd(), 'project.config.mjs'))) {
    proCfg = await getProjectCfg()
  } else {
    Log('missing config file: project.config.mjs', 'red')
  }

  if (proCfg && proCfg.server && proCfg.server.proxy) {
    config.server.proxy = proCfg.server.proxy
  }

  // 代理
  if (config.server.proxy) {
    // 循环添加代理
    const proxyTable = config.server.proxy
    Object.keys(proxyTable).forEach((context) => {
      let options = proxyTable[context]
      if (typeof options === 'string') {
        options = {
          target: options,
          changeOrigin: true,
          logs: true
        }
      }
      app.use(proxy(context, options))
    })
  }
  // 404会跳首页
  app.use(historyApiFallback({ whiteList: ['/api'] }))
  // 静态文件
  app.use(kstatic(process.cwd()))
  // 启动服务
  app.listen(config.server.port, ()=> {
    Log('******************************************************************', 'green')
    Log(`server is running on ${config.server.port}`, 'green')
    Log('******************************************************************', 'green')
  })
})
 
program.parse(process.argv) 
