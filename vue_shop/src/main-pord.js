import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import NProgress from 'nprogress'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

Vue.config.productionTip = false
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 在request拦截器中，展示进度条 NProgress.start()

axios.interceptors.request.use(config => {
  console.log(config)
  NProgress.start()
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})

// 在response拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios
Vue.filter('dateFormat', function(origin) {
  const date = new Date(origin)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDate() + '').padStart(2, '0')
  const hour = (date.getHours() + '').padStart(2, '0')
  const minute = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
