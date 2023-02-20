# @windwithfo/cli
> https://github.com/windwithfo/cli


## Install

```
pnpm add -g @windwithfo/cli

# without pnpm install by local
pnpm link --global
```

## Command
### init project 创建模板项目

```
wc init
```
1. 输入这个命令后，会先检查本地模板，如果有则会使用，直接显示可用模板列表，没有会先去远程仓库下载模版。远程仓库未授权会报128的错误，需要联系管理员进行项目授权。模版下载完毕会显示当前可用的模板。
2. 选择需要的模板后，根据引导提示，输入项目名称会在当前目录新建文件夹，在新文件夹中安装项目依赖的node_modules库。执行完成后会有日志提示项目运行方式。

### run project 启动项目(***需要在项目根目录执行***)

```
wc dev
wc dev -e, --env <dotenv>
```
1. 通过init名称创建的项目，可以在根目录通过调用这个命令以dev模式启动开发服务器，默认读取环境变量文件.env.develpoment。
2. 使用其他环境变量文件通过指定-e，--env参数实现，如hc dev -e test或hc dev --env test将读取.env.test文件。

### run script in package.json 用script启动项目(***需要在项目根目录执行***)

```
// scriptName是项目package.json中的的script脚本名，不输入的话会自动读取列表显示出来手动选择
// scriptName is  a string value in package.json scripts keys
wc run
wc run -n,--name <scriptName>
```
1. 该命令用于运行现有项目中的package.json自带的script命令。
2. 不带参数会读取列表提供给用户选择，带参数会查找命令直接运行。

### build project 打包项目(***需要在项目根目录执行***)

```
wc build
```
通过init名称创建的vue项目，可以在根目录执行这个命令进行构建项目

### run koa server 启动一个vite的服务器(***需要在项目根目录执行***)

```
wc serve
```
在任意目录运行，启动一个koa的server。支持esmodule脚本导入。默认读取当前目录的project.config.mjs作为配置文件。

### fix porject config 接入cli迁移用脚本,生成配置文件(***需要在项目根目录执行***)

```
wc fix
```
* 在项目根目录运行，处理一些对接cli的自动化工作。目前共3个选项。
* package.json 合并模板库和本地package.json文件，升级依赖包版本，自动安装依赖
* project.config.mjs 根据输入生成project.config.mjs的项目配置文件，用于执行其他操纵
* build 针对使用vue或react的项目，可以一键接入或升级构建目录(覆盖式)

### clean project 创建模板项目

```
wc clean
wc clean temp
```

* 目前只有一个清理功能，清理本地模板文件。下次使用时重新下载。用于处理一些无法自动更新的情况。

## project.config.mjs 配置
### view
> string

使用的模板类型，例如：vue2,vue3,react,svelte等
### ssr
> boolean

是否服务端渲染，用于处理ssr的特殊内容，暂时未使用。

### build
> stirng

构建方式，可选值：vite,webpack。

### single
> boolean

vue和react项目才有效的选项，用于区分页面组织方式

### views
> array

vue和react项目，在使用webpack时候配置的入口页面信息，多页面才需要，单页面可不填，默认为index.html

### build
> object

vue和react项目，在使用vite时候配置的构建配置信息
eg:
```
  build: {
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), 'index.html'),
      },
    }
  }
```

### copy
> array

构建完成后需要额外拷贝到输出目录的文件，vite和webpack构建配置略有不同
eg:
```
// webpack
copy: ['project.config.mjs'],

// vite
copy: [{
  from: 'project.config.mjs',
  to: 'dist/project.config.mjs'
}],
```