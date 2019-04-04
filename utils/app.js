import { wxGetSetting, wxOpenSetting, wxAuthorize, wxGetUserInfo, wxGetLocation } from './wx'
import { $confirm, $authorizeUserInfo } from '../template/popup/index'

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

const scopeMsg = { // 获取用户信息及手机号需要使用BUTTON组件
  'userLocation': '地理位置',
  'address': '通讯地址',
  'invoiceTitle': '发票抬头',
  'invoice': '发票获取',
  'werun': '运动步数',
  'record': '录音功能',
  'writePhotosAlbum': '相册保存权限',
  'camera': '摄像头'
}
// 打开授权提示
export function openSetting (scope) {
  return new Promise((resolve, reject) => {
    $confirm({
      title: '提示',
      content: `申请打开${scopeMsg[scope]}权限`,
      confirmText: '设置',
      callback: res => {
        if (res.confirm) {
          wxOpenSetting(scope).then(bool => {
            if (!bool) return false
            resolve()
            res.close()
          })
          return false
        } else {
          reject('取消授权')
        }
      }
    })
  })
}
// 验证是否有打开授权 没有调用授权
export function checkSetting (scope) {
  return wxGetSetting(scope).then(res => {
    if (res) return true
    if (res !== false) return wxAuthorize(scope)
    return openSetting(scope)
  })
}
// 获取当前的地理位置、速度
export function getLocation (type = 'wgs84', altitude = false) {
  return checkSetting('userLocation').then(() => wxGetLocation(type, altitude))
}
