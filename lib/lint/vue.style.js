module.exports = {
  extends: 'stylelint-config-html/vue',
  customSyntax: 'postcss-html',
  rules: {
    // 色值定义使用小写字母
    'color-hex-case': 'lower',
    // 色值定义使用简写
    'color-hex-length': 'short',
    // 字体定义加引号
    'font-family-name-quotes': 'always-unless-keyword',
    // 字符串单行书写
    'string-no-newline': true,
    // 单引号规则
    'string-quotes': 'single',
    // 0值无单位
    'length-zero-no-unit': true,
    // 分号换行
    'declaration-block-semicolon-newline-after': 'always',
    // 单位小写
    'unit-case': 'lower',
    // 关键词小写
    'value-keyword-case': 'lower',
    // 禁止空规则
    'block-no-empty': true,
    // 最多连续空行数
    'max-empty-lines': 1,
    // 缩进
    indentation: 2,
    // 最后留一行空行
    'no-missing-end-of-source-newline': true,
    // @引入文件时占一行
    'at-rule-semicolon-newline-after': 'always',
    // 多个逗号间隔的选择器换行
    'selector-list-comma-newline-after': 'always',
    // 规则块间留一个空行，第一项和注释除外
    'rule-empty-line-before': ['always',
      {
        except: [
          'first-nested',
          'after-single-line-comment'
        ],
        ignore: ['after-comment']
      }
    ],
    // 块结束换行
    'block-opening-brace-newline-after': 'always',
    // 块开始换行
    'block-closing-brace-newline-before': 'always',
    // 块开始处一个空格
    'block-opening-brace-space-before': 'always',
    // 冒号前无空格
    'declaration-colon-space-before': 'never',
    // 冒号后空格
    'declaration-colon-space-after': 'always',
    // 选择器命名规则
    'selector-class-pattern': /\S*/,
  }
}
