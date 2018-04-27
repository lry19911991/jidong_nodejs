const gulp = require('gulp')
const ossSync = require('gulp-oss-sync')
const axios = require('axios')

// 触发服务端部署脚本
gulp.task('server', async () => {
  const {data: {message}} = await axios({
    method: 'POST',
    url: 'https://hongbao.xxooweb.com/publish',
    data: {
      key: process.env.ELEME_PUBLISH_KEY
    }
  })
  console.log(message)
})

// 静态资源部署到阿里云 OSS
const ossSetting = {
  connect: {
    region: 'oss-cn-hongkong',
    accessKeyId: process.env.ALIOSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIOSS_ACCESS_KEY_SECRET,
    bucket: 'elmhb'
  },
  setting: {
    dir: '',
    noClean: false,
    force: true,
    quiet: true
  },
  controls: {
    headers: {
      'Cache-Control': 'max-age=' + 60 * 60 * 24 * 365 * 10
    }
  }
}
const ossHtmlSetting = Object.assign({}, ossSetting, {
  controls: {
    headers: {
      'Cache-Control': 'no-cache'
    }
  }
})
gulp.task('web:res', () => gulp.src(['web/dist/**/*', '!web/dist/index.html']).pipe(ossSync(ossSetting)))
gulp.task('web:html', ['web:res'], () => gulp.src('web/dist/index.html').pipe(ossSync(ossHtmlSetting)))
gulp.task('web', ['web:html'])

gulp.task('default', ['server', 'web'])
