const querystring = require('querystring')
const cookies = require('./cookies')
const logger = require('../logger')
const timeout = require('../timeout')
const superagent = require('superagent')
const randomPhone = require('../random-phone')


//向京东到家发起请求
async function requestJDUrl(url) {
  return new Promise(async resolve => {
    try {

      //这里采用了 superagent
      superagent.get(url)
        .end(function (err, sres) {
          if (err) {
            console.log(err);
            console.log(`请求京东到家出错`);
          }
          if (sres) {
            let res = sres.body;
            if (res.code !== '0') {
              console.log(`请求京东返回错误code ${res.code} 消息${res.msg}`);
              //重新发起请求
              resolve(requestJDUrl(url));
            } else {
              console.log(`请求京东返回成功code ${res.code} 消息${res.msg}`);
              resolve(res.result.receiveUserList)
            }
          }
        })
      // resolve({message: await request(options)})
    } catch (e) {
      logger.error(e.message)
      resolve({
        message: e.message,
        status: (e.response || {}).status
      })
    }
  })



}


async function request({mobile, url} = {}) {

  const query = querystring.parse(decodeURIComponent(url))
  query.shareId=decodeURIComponent(query.shareId)
  query.maxCouponPlace=query.h5_redirect_url.split('=').pop();
  // const query = querystring.parse(redirectUrl.redirect_uri);
  let index = 0
  let number = -1

  return (async function lottery() {
    let count = 0
    let cookie
    do {
      if (index > cookies.length - 1) {
        if (count >= 3 || number !== 1) {
          logger.error('循环搜寻结束或下一个不是最佳', count, number)
          throw new Error('服务器繁忙，请稍后重试\n（如果重试仍然不行，请换一个红包链接再来）')
        }
        // 如果这个是最佳红包，等两秒，再继续从头搜寻 “没有被锁定的 cookie”
        index = 0
        count++
        await timeout(2000)
      }
      cookie = cookies[index++]
    } while (cookie.lock)

    if (!query.shareId ||
      !query.maxCouponPlace ||
      isNaN(query.maxCouponPlace) ||
      !cookie) {
      throw new Error('红包链接不正确\n或\n请求服务器失败')
    }

    let phone
    if (number === 1) {
      // 如果这个是最佳红包，换成指定的手机号领取，并锁定 openId
      cookie.phone = mobile
    } else {
      cookie.phone = randomPhone(mobile)
    }

    let records = []
    try {
      records =await requestJDUrl(`https://daojia.jd.com/client?functionId=get/getCouponByWeChat&body={"code":"${query.codeId}","unionId":"${cookie.unionId}","openId":"${cookie.openId}","shareId":"${query.shareId}","fromSource":"2","phone":"${cookie.phone}","channel":"packet","ndr":1}&platCode=H5&appName=paidaojia`)
    } finally {
      cookie.lock = false
    }

    console.info('ss');
    let length = records.length;
    logger.info(`已经领 ${length} 个红包 领取的手机号 ${cookie.phone}`);

    number = query.maxCouponPlace - length

    if (query.maxCouponPlace <= length) {
      // 计算剩余第几个为最佳红包
      if (number <= 0) {
        // 有时候领取成功了，但是没有返回 lucky，再调一次就可以了
        const lucky = records.find(r => r.maxCouponFlag) || await requestJDUrl(url);

        logger.info('手气最佳红包已被领取', JSON.stringify(lucky))
        return (lucky && lucky.quota)
          ? `手气最佳红包已被领取\n\n手气最佳：${lucky.nickName}\n红包金额：${lucky.quota/100} 元`
          : '红包被人抢完\n或\n服务器繁忙'
      }
    }
    logger.info(`还要领 ${number} 个红包才是手气最佳`)
    return lottery()
  })()
}

function response(options) {
  return new Promise(async resolve => {
    try {
      resolve({message: await request(options)})
    } catch (e) {
      logger.error(e.message)
      resolve({
        message: e.message,
        status: (e.response || {}).status
      })
    }
  })
}

module.exports = async options => {
  let res = await response(options)
  // 400 重试一次
  if (res.status === 400) {
    res = await response(options)
    // 仍然 400
    if (res.status === 400) {
      res.message = '服务器繁忙'
    }
  }
  return res
}
