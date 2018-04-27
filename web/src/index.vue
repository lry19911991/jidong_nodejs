<template>
  <div class="panel panel-default">
    <div class="panel-heading">一键领取京东手气最佳红包(仿领取饿了么红包)</div>
    <div class="panel-body">
      <div class="form-group">
        <label>要领取手气最佳红包的手机号码</label>
        <input type="mobile" class="form-control" v-model="mobile" placeholder="11位手机号码" maxlength="11">
      </div>
      <div class="form-group">
        <label>京东到家分享出来的红包链接</label>
        <input type="text" class="form-control" v-model="url" placeholder="红包完整 URL 链接">
        <p class="url-demo">
          <br>1. 京东红包：https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfca9a073810e992d&redi
          <br>rect_uri=https://daojia.jd.com/client?functionId=client/h5redirec
        </p>
      </div>
      <div class="form-group">

        <button type="button" class="btn btn-danger submit" :disabled="submit" @click="getHongbao">
          {{submit ? '正在领取...' : '领取手气最佳红包'}}
        </button>
      </div>
      <div class="form-group">
        <br/>
        <br/>
        <h4>领取红包方法</h4>
        <label>步骤一 、用电脑浏览器打开分享链接，并复制</label>
        <img src="./static/step1.png">
        <label>步骤一 、粘贴分享链接，填入手机号 点击领取</label>
        <img src="./static/step2.png">
      </div>
    </div>
  </div>
</template>

<script>
  import 'bootstrap/dist/css/bootstrap.css'
  import axios from 'axios'
  import ClipboardJS from 'clipboard'

  export default {
    data () {
      return {
        url: '',
        mobile: localStorage.getItem('mobile') || '',
        submit: false,
        domains,
        domain: 0
      }
    },
    mounted () {

    },
    methods: {
      async getHongbao () {
        if (this.submit) {
          return
        }
        const {url, mobile, domain} = this
        this.submit = true
        try {
          var data22 = await axios.post(`  'http://192.168.10.78:3007/hongbao`, {url, mobile})
          const {data: {message}}=data22;
          alert(message)
        } catch (e) {
          console.error(e)
          alert('服务器繁忙，请稍后重试')
        }
        this.submit = false
        localStorage.setItem('mobile', mobile)
      },
    }
  }
</script>

<style lang="less">
  .panel {
    width: 410px;
    margin: 15px auto;
  }

  .breadcrumb {
    margin-bottom: 10px;
    white-space: nowrap;
  }

  .submit,
  img {
    width: 100%;
  }

  .tip {
    padding-bottom: 10px;
  }

  .qrcode {
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
  }

  .mutiline {
    white-space: normal;
  }

  .url-demo {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    line-height: 1.5;

    span {
      color: #666;
    }
  }

  .ali-hongbao-pc {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    left: 50%;
    margin-left: -500px;
    width: 250px;
    z-index: 10;
    text-align: center;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;

    p {
      padding-top: 20px;
    }
  }

  .ali-hongbao-m {
    display: none;
  }

  @media screen and (max-width: 480px) {
    .panel {
      width: 100%;
      margin: 0;
      border: 0;
      box-shadow: none;
    }
  }

  @media screen and (max-width: 768px) {
    .ali-hongbao-pc {
      display: none;
    }
  }

  @media screen and (max-width: 1024px) {
    .ali-hongbao-m {
      display: block;
      width: 100%;
      margin-top: 15px;
    }
  }
</style>
