# @windwithfo/cli
> https://github.com/windwithfo/cli


## Install

```
npm install @windwithfo/cli -g --registry=https://registry.npm.taobao.org

# without npm install by local
npm link
```

## Command
### init project 创建模板项目

```
wc init
```
输入这个命令后，会显示当前可用的模板。选择需要的模板后，根据引导提示，输入项目名称会在当前目录新建文件夹，在新文件夹中安装项目依赖的node_modules库。执行完成后会有日志提示项目运行方式。

### run project 启动项目(***需要在项目根目录执行***)

```
wc dev
wc dev -e, --env <dotenv>
```
通过init名称创建的项目，可以在根目录通过调用这个名字以dev模式启动开发服务器，默认读取环境变量文件.env.develpoment。
使用其他环境变量文件通过指定-e，--env参数实现，如hc dev -e test或hc dev --env test将读取.env.test文件。

### run script in package.json 用script启动项目(***需要在项目根目录执行***)

```
// scriptName是项目package.json中的的script脚本名，不输入的话会自动读取列表显示出来手动选择
// scriptName is  a string value in package.json scripts keys
wc run
wc run -n,--name <scriptName>
```
该命令用于运行现有项目中的package.json自带的script命令。不带参数会读取列表提供给用户选择，带参数会查找命令直接运行。

### publish project 打包项目(***需要在项目根目录执行***)

```
wc pub
```
通过init名称创建的vue项目，可以在根目录执行这个命令进行构建项目

### lint project 代码风格校验(***需要在项目根目录执行***)

```
wc lint
```
在任意目录运行，执行eslint检查

### run koa server 启动一个vite的服务器(***需要在项目根目录执行***)

```
wc serve
```
在任意目录运行，启动一个koa的server。

### fix porject config 接入cli迁移用脚本,生成配置文件(***需要在项目根目录执行***)

```
wc fix
wc fix -p, --package
wc fix -c, --config
```
在项目根目录运行，处理一些对接cli的自动化工作。
-p 参数整理package.json依赖包版本，自动安装依赖
-c 生成project.config.js的模板文件
