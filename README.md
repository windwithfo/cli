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

### run project 启动项目(***需要在项目根目录执行***)

```
wc run
```
**when use multi-package template,you can run with:**

```
wc run <pkgname>
wc run -n <pkgname>
wc run --name <pkgname>
```

### publish project 打包项目(***需要在项目根目录执行***)

```
wc pub
```
**when use multi-package template,you can pub with:**

```
wc pub <pkgname>
wc pub -n <pkgname>
wc pub --name <pkgname>
```
### lint project 代码风格校验(***需要在项目根目录执行***)

```
wc lint
```