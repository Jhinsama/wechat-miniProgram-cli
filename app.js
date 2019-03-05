import * as APP from './utils/app'
import * as WXAPI from './utils/wx'
import * as POPUP from './template/popup/index'
App({
  ...APP,
  ...WXAPI,
  ...POPUP
})
