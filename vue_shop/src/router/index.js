import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () =>
  import(
    /* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue'
  )
// import User from '../components/user/User.vue'
const User = () =>
  import(
    /* webpackChunkName: "user_rights_roles" */ '../components/user/User.vue'
  )
// import Rights from '../components/power/Rights.vue'
const Rights = () =>
  import(
    /* webpackChunkName: "user_rights_roles */ '../components/power/Rights.vue'
  )
// import Roles from '../components/power/Roles.vue'
const Roles = () =>
  import(
    /* webpackChunkName: "user_rights_roles" */ '../components/power/Roles.vue'
  )
// import Cate from '../components/goods/Cate.vue'
const Cate = () =>
  import(/* webpackChunkName: "cate_parent" */ '../components/goods/Cate.vue')
// import Parent from '../components/goods/Params.vue'
const Parent = () =>
  import(/* webpackChunkName: "cate_parent" */ '../components/goods/Params.vue')
// import List from '../components/goods/List.vue'
const List = () =>
  import(
    /* webpackChunkName: "list_AddGoods_order" */ '../components/goods/List.vue'
  )
// import AddGoods from '../components/goods/AddGoods.vue'
const AddGoods = () =>
  import(
    /* webpackChunkName: "list_AddGoods_order" */ '../components/goods/AddGoods.vue'
  )
// import Order from '../components/order/Order.vue'
const Order = () =>
  import(
    /* webpackChunkName: "list_AddGoods_order" */ '../components/order/Order.vue'
  )
// import Report from '../components/report/Report.vue'
const Report = () =>
  import(/* webpackChunkName: "report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: 'welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Parent },
      { path: '/goods', component: List },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径来
  // next 是一个函数， 表示放行
  // next()表示放行, next('/login') 强制跳转

  if (to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

// 捕获重复点击相同路由报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
