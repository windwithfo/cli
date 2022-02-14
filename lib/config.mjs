/**
 * @file 工具函数集合
 * @author dongkunshan(windwithfo@yeah.net)
 */

import path        from 'path'
import { libPath } from './tools.js'

export default {
  temp: {
    dir: path.resolve(libPath, '../temp', '@windwithfo'),
    url: 'github:windwithfo/temps'
  }
}
