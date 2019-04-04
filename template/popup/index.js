// 获取当前页面实例
function getNowPage () {
  let pages = getCurrentPages()
  let page = pages[pages.length - 1]
  return page
}

const defaultZindex = 999

// 提示框默认参数
const defaultToast = {
  content: '',// String   显示的内容
  func: null, // Function 自动关闭后执行的函数
  ms: 2500    // Number   自动关闭计时
}

// 跳转方式对应的方法
const skipTypeWithFunc = {
  'navigate': wx.navigateTo,
  'redirect': wx.redirectTo,
  'switchTab': wx.switchTab,
  'reLaunch': wx.reLaunch,
  'navigateBack': wx.navigateBack
}
// 通知栏类型对应图标
const noticeTypeWithIcon = {
  'none': null,
  'info': '/template/popup/icon/info.svg',
  'success': '/template/popup/icon/success.svg',
  'error': '/template/popup/icon/error.svg',
  'warning': '/template/popup/icon/warning.svg',
  'loading': '/template/popup/icon/loading.svg',
}
// 通知栏默认参数
const defaultNotice = {
  type: 'info',         // String   通知类型
  title: '',            // String   通知栏标题
  content: '',          // String   通知内容
  path: '',             // String   点击通知栏跳转的路径
  skipType: '',         // String   跳转方式
  duration: null,       // Number   自动关闭的延时 不关闭为0
  closable: null,       // Boolean  是否显示关闭按钮
  onClose: null         // Function 关闭时的回调
}

// 加载框默认参数
const defaultLoading = {
  content: '',      // 加载时的文字提示
  color: '#fff',    // 字体动画的颜色
  background: '#000'// 背景色
}

// 确认框默认参数
const defaultConfirm = {
  title: '',              // String   提示的标题
  content: '',            // String   提示的内容
  showCancel: true,       // Boolean  是否显示取消按钮
  cancelText: '取消',     // String   取消按钮的文字
  cancelColor: '#000000', // String   取消按钮的文字颜色
  confirmText: '确定',    // String   确认按钮的文字
  confirmColor: '#85c56e',// String   确认按钮的文字颜色
  callback: null,         // Function 点击按钮后的回调函数 函数返参为false时将不自动关闭弹框
  share: null             // String   分享的参数
}

// 弹出提示
export function $toast (options = {}) {
  let page = getNowPage()

  if (!page.ToastId) page.ToastId = 0
  if (!page.CSSzIndex) page.CSSzIndex = 0
  if (!page.ToastQueue) page.ToastQueue = []

  let data = Object.assign({}, defaultToast, options instanceof Object ? options : { content: options || '' })

  page.ToastId++
  page.CSSzIndex++
  let item = {
    zIndex: page.CSSzIndex + defaultZindex,
    id : page.ToastId,
    content: data.content
  }
  page.ToastQueue.push(item)
  page.setData({ $TOAST: page.ToastQueue })

  let close = function $close (next = true) { // next:是否执行传入的Function
    if (!close) return false
    close = null
    item.hide = true
    page.setData({ $TOAST: page.ToastQueue })
    setTimeout(() => {
      let index = page.ToastQueue.indexOf(item)
      page.ToastQueue.splice(index, 1)
      let $TOAST = !page.ToastQueue.length ? null : page.ToastQueue
      if (!$TOAST) page.ToastId = 0
      page.setData({ $TOAST })
      if (next && data.func) data.func()
      page = data = item = null
    }, 200)
  }

  if (!data.ms) {
    return close
  } else {
    let timer = setTimeout(close, data.ms)
    return function $CLOSE (next = true) {
      if (!close) return false
      clearTimeout(timer)
      close(next)
      timer = null
    }
  }
}

// 通知栏点击事件
function noticeTap (e) {
  let dataset = e.currentTarget.dataset
  let index = dataset.i
  let type = dataset.type
  let item = this.data.$NOTICE[index]
  if (type === 'skip' && item.path) skipTypeWithFunc[item.skipType]({ url: item.path })
  item.close()
}
// 弹出通知
export function $notice (options = {}) {
  let page = getNowPage()

  if (!page.NoticeId) page.NoticeId = 0
  if (!page.CSSzIndex) page.CSSzIndex = 0
  if (!page.NoticeQueue) page.NoticeQueue = []
  if (!page.$handleNoticeTap) page.$handleNoticeTap = noticeTap

  let data = Object.assign({}, defaultNotice, options instanceof Object ? options : { title: options || '' })
  if (!noticeTypeWithIcon[data.type]) data.type = 'none'
  if (data.closable === true && data.duration === null) data.duration = 0
  if (data.duration === 0 && data.closable === null) data.closable = true
  if (data.path && !skipTypeWithFunc[data.skipType]) data.skipType = 'navigate'
  if (data.path && data.duration === null && data.closable === null) data.closable = true, data.duration = 0

  page.NoticeId++
  page.CSSzIndex++
  let item = Object.assign({}, data, {
    id: page.NoticeId,
    zIndex: page.CSSzIndex + defaultZindex,
    icon: noticeTypeWithIcon[data.type]
  })

  let close = function $close (next = true) {
    if (!close) return false
    close = null
    item.hide = true
    page.setData({ $NOTICE: page.NoticeQueue })
    setTimeout(() => {
      let index = page.NoticeQueue.indexOf(item)
      page.NoticeQueue.splice(index, 1)
      let $NOTICE = !page.NoticeQueue.length ? null : page.NoticeQueue
      if (!$NOTICE) page.NoticeId = 0
      page.setData({ $NOTICE })
      if (next && item.onClose) item.onClose()
      page = data = item = null
    }, 200)
  }

  item.close = close
  page.NoticeQueue.forEach(item => item.hide ? null : item.close())
  page.NoticeQueue.push(item)
  page.setData({ $NOTICE: page.NoticeQueue })

  if (item.duration === 0) {
    return close
  } else {
    let timer = setTimeout(close, item.duration || 5000)
    return function $CLOSE (next = true) {
      if (!close) return false
      clearTimeout(timer)
      close(next)
      timer = null
    }
  }
}

let loadTimer
// 判断加载动画队列 并显示队列最后一个加载动画
function checkLoading (page) {
  let arr = page.LoadQueue
  if (!arr.length) {
    loadTimer = setTimeout(() => page.setData({ $LOADING: null }), 300)
  } else {
    page.setData({ $LOADING: arr[arr.length - 1] })
  }
}
// 显示加载动画
export function $loading (options = {}) {
  clearTimeout(loadTimer)
  let page = getNowPage()

  if (!page.CSSzIndex) page.CSSzIndex = 0
  if (!page.LoadQueue) page.LoadQueue = []

  page.CSSzIndex++
  let item = Object.assign({}, defaultLoading, options instanceof Object ? options : { content: options || '' }, { zIndex: page.CSSzIndex + defaultZindex })
  page.LoadQueue.push(item)
  page.setData({ $LOADING: item })

  return function $loadend () {
    let index = page.LoadQueue.indexOf(item)
    page.LoadQueue.splice(index, 1)
    checkLoading(page)
    page = item = null
  }
}

// 确认框按钮点击事件
function confirmTap (e) {
  let dataset = e.currentTarget.dataset
  let index = dataset.i
  let type = dataset.type
  let item = this.data.$CONFIRM[index]
  item.callback({
    confirm: type === 'confirm',
    cancel: type === 'cancel',
    detail: item.authorize && type === 'confirm' ? e.detail : null,
    event: e
  })
}
// 弹出确认框
export function $confirm (options = {}) {
  let page = getNowPage()

  if (!page.ConfirmId) page.ConfirmId = 0
  if (!page.CSSzIndex) page.CSSzIndex = 0
  if (!page.ConfirmQueue) page.ConfirmQueue = []
  if (!page.$handleConfirm) page.$handleConfirm = confirmTap

  page.ConfirmId++
  page.CSSzIndex++
  let item = Object.assign({}, defaultConfirm, options instanceof Object ? options : {
    content: options || '',
    showCancel: false
  }, {
    id: page.ConfirmId,
    zIndex: page.CSSzIndex + defaultZindex
  })

  let close = function () {
    if (!close) return false
    close = null
    // item.hide = true // 设置hide可以增加退场动画
    // page.setData({ $CONFIRM: page.ConfirmQueue })
    // setTimeout(() => {
      let index = page.ConfirmQueue.indexOf(item)
      page.ConfirmQueue.splice(index, 1)
      page.setData({ $CONFIRM: page.ConfirmQueue })
      if (!page.ConfirmQueue.length) page.ConfirmId = 0
      page = item = null
    // }, 100)
  }

  let callback = item.callback
  item.callback = function (res) {
    Object.assign(res, { close })
    let autoClose = callback ? callback(res) : null
    if (!close) return false
    if (autoClose === false) return false
    else close()
  }

  page.ConfirmQueue.push(item)
  page.setData({ $CONFIRM: page.ConfirmQueue })


  return close
}

// 授权获取用户信息
export function $authorizeUserInfo (options = {}) {
  return new Promise(resolve => {
    $confirm(Object.assign({
      title: '请求授权',
      content: '申请获取您的公开信息',
      confirmText: '授权'
    }, options, {
      authorize: 'userInfo',
      callback: res => {
        if (res.confirm) {
          if (res.detail.errMsg !== 'getUserInfo:ok') return false
          else return resolve(res.detail)
        }
      }
    }))
  })
}

// 授权获取手机号
export function $authorizePhoneNumber (options = {}) {
  return new Promise(resolve => {
    $confirm(Object.assign({
      title: '请求授权',
      content: '申请获取您的手机号码',
      confirmText: '授权'
    }, options, {
      authorize: 'phoneNumber',
      callback: res => {
        if (res.confirm) {
          if (res.detail.errMsg !== 'getPhoneNumber:ok') return false
          else return resolve(res.detail)
        }
      }
    }))
  })
}
