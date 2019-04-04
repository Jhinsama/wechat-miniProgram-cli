let hasTask = wx.getSystemInfoSync().SDKVersion >= '1.7'

function GetSocketTask (options) {
  if (hasTask) return wx.connectSocket(options)
  return {
    send: options => wx.sendSocketMessage(options),
    close: options => wx.closeSocket(options),
    onOpen: cb => wx.onSocketOpen(cb),
    onError: cb => wx.onSocketError(cb),
    onClose: cb => wx.onSocketClose(cb),
    onMessage: cb => wx.onSocketMessage(cb)
  }
}

function WebSocket (url, options = {}) {
  if (typeof url !== 'string') options = url
  else options.url = url
  this.options = options
  this.message = null
  this.SocketTask = null
  this.queue = []
  this.open = false
}
WebSocket.prototype = {
  init () {
    this.SocketTask = GetSocketTask(this.options)

    // 监听 WebSocket 连接打开事件
    this.SocketTask.onOpen(res => {
      this.open = true
      while (this.queue.length > 0) {
        let data = this.queue.shift()
        this.send(data)
      }
      this.options.onOpen(res)
    })
  
    // 监听 WebSocket 错误事件
    this.SocketTask.onError(res => {
      this.options.onError(res)
    })

    // 监听 WebSocket 连接关闭事件
    this.SocketTask.onClose(res => {
      this.open = false
      this.SocketTask = null
      this.options.onClose(res)
      if (res.code === 1000) return false
      this.queue.push(this.message)
      this.init()
    })

    // 监听 WebSocket 接受到服务器的消息事件
    this.SocketTask.onMessage(res => {
      res.data = JSON.parse(res.data)
      this.options.onMessage(res)
    })
  },

  // 通过 WebSocket 连接发送数据
  send (data) {
    if (this.open && this.SocketTask) {
      this.SocketTask.send({ data: JSON.stringify(data) })
    } else {
      this.queue.push(data)
      if (!this.SocketTask) this.init()
    }
    if (!this.message) this.message = data
  },

  // 关闭 WebSocket 连接
  close (options = {}) {
    if (!this.SocketTask) return false
    this.SocketTask.close(Object.assign({
      code: 1000,
      reason: '正常关闭连接'
    }, options))
  }
}

export default WebSocket