/**
 * @file babel配置
 * @author dongkunshan(windwithfo@yeah.net)
 */

module.exports = {
  presets: [
    ['@babel/env', {
      targets: {
        edge: '17',
        firefox: '60',
        chrome: '67',
        safari: '11.1',
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', {
      legacy: true
    }],
    ['@babel/plugin-proposal-class-properties', { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ['component', {
      libraryName: 'element-ui',
      styleLibraryName: 'theme-chalk'
    }],
    '@babel/plugin-transform-typescript'
  ]
}
