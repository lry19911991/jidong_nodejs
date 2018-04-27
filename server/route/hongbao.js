const express = require('express')
const router = express.Router()
const redirect = require('../service/redirect')
const jingdon = require('../service/jingdon')

const superagent = require('superagent');

const logger = require('../service/logger')

router.post('/', async (req, res, next) => {
  try {
    let {url = '', mobile} = req.body

    // 短链接处理
    if (/^https?:\/\/url\.cn\//i.test(url)) {
      url = await redirect(url)
    }

    if (!url || !mobile) {
      throw new Error('请将信息填写完整')
    }

    if (!/^1\d{10}$/.test(mobile)) {
      throw new Error('请填写 11 位手机号码')
    }

    logger.info('开始抢红包', [url, mobile])

    if (url.indexOf('https://daojia.jd.com/client') !== -1) {
      res.json(await jingdon({url, mobile}))
    } else {
      throw new Error('红包链接不正确')
    }
  } catch ({message}) {
    logger.error(message)
    res.json({message})
  }
})

module.exports = router
