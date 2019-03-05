import { wxGetSetting, wxGetUserInfo } from './wx'
import { $authorizeUserInfo } from '../template/popup/index'

// 获取当前Page实例
export function getNowPage () {
  let pages = getCurrentPages()
  let page = pages[pages.length - 1]
  return page
}

// 获取当前页面的url 可传入data拼接参数到url尾部
export function getNowUrl (data) {
  let page = getNowPage()
  let url = page.route + '?'
  let opt = Object.assign(page.options, data)
  for (let key in opt) url += `${key}=${opt[key]}&`
  return url.substring(0, url.length - 1)
}

// 获取用户信息
export function getUserInfo (withCredentials = false) {
  return wxGetSetting('userInfo').then(res => {
    if (!res) return $authorizeUserInfo()
    else return wxGetUserInfo(withCredentials)
  })
}
