// 调用 wx.login 返回 code
export function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      complete(res) {
        if (res.errMsg === 'login:ok') resolve(res.code)
        else reject('登录失败' + res.errMsg)
      }
    })
  })
}

// 获取用户授权信息 返回值为 undefined 时 表示该权限的授权还未请求过
export function wxGetSetting(scope) {
  scope = 'scope.' + scope
  return new Promise((resolve, reject) => {
    wx.getSetting({
      complete(res) {
        if (res.errMsg === 'getSetting:ok') resolve(res.authSetting[scope])
        else reject('获取授权信息失败')
      }
    })
  })
}

// 调起客户端小程序设置界面 返回用户设置的操作结果
export function wxOpenSetting(scope) {
  scope = 'scope.' + scope
  return new Promise((resolve, reject) => {
    wx.openSetting({
      complete(res) {
        if (res.errMsg === 'openSetting:ok') resolve(res.authSetting[scope])
        else reject('打开授权信息失败')
      }
    })
  })
}

// 获取用户信息 withCredentials 为 true 时 返回的值会带上 encryptedData iv 等敏感信息
export function wxGetUserInfo(withCredentials = false, lang = 'zh_CN') {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      lang,
      withCredentials,
      complete(res) {
        if (res.errMsg === 'getUserInfo:ok') resolve(res)
        else reject('获取用户信息失败')
      }
    })
  })
}

// 发起授权请求
export function wxAuthorize(scope) {
  scope = 'scope.' + scope
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope,
      complete(res) {
        if (res.errMsg === 'authorize:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 图片
// 在新页面中全屏预览图片
export function wxPreviewImage(options = {}) {
  return new Promise((resolve, reject) => {
    wx.previewImage(Object.assign(options, {
      complete(res) {
        if (res.errMsg === 'previewImage:ok') resolve()
        else reject(res.errMsg)
      }
    }))
  })
}

// 从本地相册选择图片或使用相机拍照
export function wxChooseImage(options = {}) {
  return new Promise((resolve, reject) => {
    wx.chooseImage(Object.assign(options, {
      complete(res) {
        if (res.errMsg === 'chooseImage:ok') resolve(res.tempFiles)
        else reject(res.errMsg)
      }
    }))
  })
}

// 获取图片信息
export function wxGetImageInfo(src) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      complete(res) {
        if (res.errMsg === 'getImageInfo:ok') resolve(res)
        else reject(res.errMsg)
      }
    })
  })
}

// 把当前画布指定区域的内容导出生成指定大小的图片
export function wxCanvasToTempFilePath(options) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath(Object.assign(options, {
      complete(res) {
        if (res.errMsg === 'canvasToTempFilePath:ok') resolve(res.tempFilePath)
        else reject(res.errMsg)
      }
    }))
  })
}

// -------------------------------------------------------------------------------- 网络
// 发起 HTTPS 网络请求
export function wxRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request(Object.assign(options, {
      complete(res) {
        console.group('wx.request.url: ' + options.url)
        console.log(options)
        console.log(res)
        console.groupEnd()
        if (res.errMsg === 'request:ok') {
          if (res.statusCode >= 500) reject('服务器错误')
          else if (res.statusCode >= 400) reject('请求出错')
          else resolve(res.data)
        } else reject('发起网络请求失败')
      }
    }))
  })
}

// 将本地资源上传到服务器
export function wxUploadFile(options) {
  return new Promise((resolve, reject) => {
    let task = wx.uploadFile(Object.assign(options, {
      complete(res) {
        console.group('wx.uploadFile.url: ' + options.url)
        console.log(options)
        console.log(res)
        console.groupEnd()
        if (res.errMsg === 'uploadFile:ok') {
          if (res.statusCode >= 500) reject('服务器错误')
          else if (res.statusCode >= 400) reject('请求出错')
          else {
            res.data = JSON.parse(res.data)
            resolve({ task, data: res.data })
          }
        } else reject('发起上传请求失败')
      }
    }))
  })
}

// 调起微信支付 需要的参数 timeStamp nonceStr package paySign
export function wxRequestPayment(data, signType = 'MD5') {
  return new Promise((resolve, reject) => {
    wx.requestPayment(Object.assign(data, {
      signType,
      complete(res) {
        console.group('wx.requestPayment')
        console.log(data)
        console.groupEnd()
        if (res.errMsg === 'requestPayment:ok') resolve(true)
        else reject(res.errMsg)
      }
    }))
  })
}

// -------------------------------------------------------------------------------- 路由
// 跳转到 tabBar 页面 并关闭其他所有非 tabBar 页面
export function wxSwitchTab(url) {
  return new Promise((resolve, reject) => {
    wx.switchTab({
      url,
      complete(res) {
        if (res.errMsg === 'switchTab:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// 关闭所有页面 打开到应用内的某个页面
export function wxReLaunch(url) {
  return new Promise((resolve, reject) => {
    wx.reLaunch({
      url,
      complete(res) {
        if (res.errMsg === 'reLaunch:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// 关闭当前页面 跳转到应用内的某个页面
export function wxRedirectTo(url) {
  return new Promise((resolve, reject) => {
    wx.redirectTo({
      url,
      complete(res) {
        if (res.errMsg === 'redirectTo:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// 保留当前页面 跳转到应用内的某个页面
export function wxNavigateTo(url) {
  return new Promise((resolve, reject) => {
    wx.navigateTo({
      url,
      complete(res) {
        if (res.errMsg === 'navigateTo:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// 关闭当前页面 返回上一页面或多级页面
export function wxNavigateBack(delta = 1) {
  return new Promise((resolve, reject) => {
    wx.navigateBack({
      delta,
      complete(res) {
        if (res.errMsg === 'navigateBack:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 导航栏
// 动态设置当前页面的标题
export function wxSetNavigationBarTitle(title) {
  return new Promise((resolve, reject) => {
    wx.setNavigationBarTitle({
      title,
      complete(res) {
        if (res.errMsg === 'setNavigationBarTitle:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 滚动
// 将页面滚动到目标位置
export function wxPageScrollTo(scrollTop, duration) {
  return new Promise((resolve, reject) => {
    wx.pageScrollTo({
      scrollTop,
      duration,
      complete(res) {
        if (res.errMsg === 'pageScrollTo:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 位置
// 使用微信内置地图查看位置
export function wxOpenLocation(latitude, longitude, options) {
  return new Promise((resolve, reject) => {
    wx.openLocation(Object.assign(options, {
      latitude,
      longitude,
      complete(res) {
        if (res.errMsg === 'openLocation:ok') resolve()
        else reject(res.errMsg)
      }
    }))
  })
}

// 获取当前的地理位置、速度
export function wxGetLocation(type = 'wgs84', altitude = false) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type,
      altitude,
      complete(res) {
        if (res.errMsg === 'getLocation:ok') resolve(res)
        else reject(res.errMsg)
      }
    })
  })
}

// 打开地图选择位置
export function wxChooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      complete(res) {
        if (res.errMsg === 'chooseLocation:ok') resolve(res)
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 剪贴板
// 设置系统剪贴板的内容
export function wxSetClipboardData(data) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data,
      complete(res) {
        if (res.errMsg === 'setClipboardData:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// 设置系统剪贴板的内容
export function wxGetClipboardData() {
  return new Promise((resolve, reject) => {
    wx.getClipboardData({
      complete(res) {
        if (res.errMsg === 'getClipboardData:ok') resolve(res.data)
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 电话
// 拨打电话
export function wxMakePhoneCall(phoneNumber) {
  phoneNumber = phoneNumber.toString()
  return new Promise((resolve, reject) => {
    wx.makePhoneCall({
      phoneNumber,
      complete(res) {
        if (res.errMsg === 'makePhoneCall:ok') resolve()
        else reject(res.errMsg)
      }
    })
  })
}

// -------------------------------------------------------------------------------- 扫码
// 调起客户端扫码界面进行扫码
export function wxScanCode(options = {}) {
  return new Promise((resolve, reject) => {
    wx.scanCode(Object.assign(options, {
      complete(res) {
        if (res.errMsg === 'scanCode:ok') resolve(res)
        else reject(res.errMsg)
      }
    }))
  })
}

// -------------------------------------------------------------------------------- 界面
// 显示 tabBar 某一项的右上角的红点
export function wxShowTabBarRedDot(index) {
  return new Promise((resolve, reject) => {
    wx.showTabBarRedDot({
      index,
      complete(res) {
        if (res.errMsg === 'showTabBarRedDot:ok') resolve(res)
        else reject(res.errMsg)
      }
    })
  })
}

// 隐藏 tabBar 某一项的右上角的红点
export function wxHideTabBarRedDot(index) {
  return new Promise((resolve, reject) => {
    wx.hideTabBarRedDot({
      index,
      complete(res) {
        if (res.errMsg === 'hideTabBarRedDot:ok') resolve(res)
        else reject(res.errMsg)
      }
    })
  })
}

