import { getNowPage } from '../../utils/app'

const defaultZindex = 999
// 提示框默认参数
const defaultToast = {
  content: '',// String   显示的内容
  func: null, // Function 自动关闭后执行的函数
  ms: 2500    // Number   自动关闭计时
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
  callback: null          // Function 点击按钮后的回调函数
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

  let close = function $close (next = true) {
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
  // if (item.hide) return false
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
