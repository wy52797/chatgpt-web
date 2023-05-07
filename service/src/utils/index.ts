interface SendResponseOptions<T = any> {
  type: 'Success' | 'Fail'
  message?: string
  data?: T
}

export function sendResponse<T>(options: SendResponseOptions<T>) {
  if (options.type === 'Success') {
    return Promise.resolve({
      message: options.message ?? null,
      data: options.data ?? null,
      status: options.type,
    })
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({
    message: options.message ?? 'Failed',
    data: options.data ?? null,
    status: options.type,
  })
}

export function getRandomString(len = 8) {
  const _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789'
  const min = 0
  const max = _charStr.length - 1
  let _str = '' // 定义随机字符串 变量
  // 判断是否指定长度，否则默认长度为15
  len = len || 15
  // 循环生成字符串
  for (let i = 0, index; i < len; i++) {
    index = (function (randomIndexFunc, i) {
      return randomIndexFunc(min, max, i, randomIndexFunc)
    })((min, max, i, _self) => {
      let indexTemp = Math.floor(Math.random() * (max - min + 1) + min)
      const numStart = _charStr.length - 10
      if (i === 0 && indexTemp >= numStart)
        indexTemp = _self(min, max, i, _self)

      return indexTemp
    }, i)
    _str += _charStr[index]
  }
  return _str
}
