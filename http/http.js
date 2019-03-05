import { HOST } from './host'

let app = getApp()

export default function http (url, data = {}) {
  Object.assign(data, {
    // 发起请求额外携带的参数
  })

  return app.wxRequest({ url: HOST + url, method: 'POST', data }).then(res => {
    // TODO 请求成功处理
    return res
  }, err => {
    // TODO 发生错误处理
    return false
  })
}
