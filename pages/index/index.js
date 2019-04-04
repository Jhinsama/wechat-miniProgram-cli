const app = getApp()

let num = 0

Page({
  data: {},
  showToast() {
    num++
    app.$toast('这是一个提示 ' + num)
  },
  showNotice() {
    app.$notice({
      title: '显示通知栏',
      content: '这里是通知内容 这里是通知内容 这里是通知内容 这里是通知内容'
    })
  },
  showConfirm() {
    app.$confirm({
      title: '测试',
      content: '这是一个模态框',
      confirmText: '确定',
      callback: function (res) {
        let close = res.close
        if (res.confirm) {
          app.$toast('点击了确定')
          return true
        } else {
          app.$confirm({
            content: '是否关闭模态框',
            callback: function (res) {
              if (res.confirm) {
                close()
                app.$toast('成功关闭模态框')
              }
            }
          })
          return false
        }
      }
    })
  },
  showLoading() {
    let ms = Math.random() * 4000 + 1000
    let load = app.$loading({
      color: '#0000ff',
      background: '#ffff00',
      content: (ms / 1000).toFixed(2) + 's'
    })
    setTimeout(load, ms)
  },
  showUserInfo() {
    app.$authorizeUserInfo({
      title: '请求授权',
      content: '授权获取用户信息',
      confirmText: '授权'
    }).then(res => {
      console.log(res)
      app.$toast(JSON.stringify(res))
    })
  },
  showPhoneNumber() {
    app.$authorizePhoneNumber({
      title: '请求授权',
      content: '授权获取手机号码',
      confirmText: '授权'
    }).then(res => {
      console.log(res)
      app.$toast(JSON.stringify(res))
    })
  }
})