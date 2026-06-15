import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/culture',
    name: 'Culture',
    component: () => import('@/views/culture/CultureList.vue'),
    meta: { title: '文化展示' }
  },
  {
    path: '/culture/:id',
    name: 'CultureDetail',
    component: () => import('@/views/culture/CultureDetail.vue'),
    meta: { title: '文化详情' }
  },
  {
    path: '/culture/publish',
    name: 'PublishCulture',
    component: () => import('@/views/culture/PublishCulture.vue'),
    meta: { title: '发布文化', requireAuth: true }
  },
  {
    path: '/spot',
    name: 'Spot',
    component: () => import('@/views/spot/SpotList.vue'),
    meta: { title: '文旅推荐' }
  },
  {
    path: '/ai',
    name: 'AIChat',
    component: () => import('@/views/ai/AIChat.vue'),
    meta: { title: 'AI问答' }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/forum/ForumList.vue'),
    meta: { title: '交流论坛' }
  },
  {
    path: '/forum/:id',
    name: 'ForumDetail',
    component: () => import('@/views/forum/ForumDetail.vue'),
    meta: { title: '帖子详情' }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('@/views/activity/ActivityList.vue'),
    meta: { title: '文化活动', requireAuth: true }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/ActivityDetail.vue'),
    meta: { title: '活动详情', requireAuth: true }
  },
  {
    path: '/activity/publish',
    name: 'PublishActivity',
    component: () => import('@/views/activity/PublishActivity.vue'),
    meta: { title: '发布活动', requireAuth: true }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/shop/ProductList.vue'),
    meta: { title: '文创商城' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/shop/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/shop/publish',
    name: 'PublishProduct',
    component: () => import('@/views/shop/PublishProduct.vue'),
    meta: { title: '发布商品', requireAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/shop/Cart.vue'),
    meta: { title: '购物车', requireAuth: true }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/OrderList.vue'),
    meta: { title: '我的订单', requireAuth: true }
  },
  {
    path: '/order/confirm',
    name: 'OrderConfirm',
    component: () => import('@/views/order/OrderConfirm.vue'),
    meta: { title: '确认订单', requireAuth: true }
  },
  {
    path: '/order/pay/:id',
    name: 'OrderPay',
    component: () => import('@/views/order/OrderPay.vue'),
    meta: { title: '订单支付', requireAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/OrderDetail.vue'),
    meta: { title: '订单详情', requireAuth: true }
  },
  {
    path: '/seller-orders',
    name: 'SellerOrders',
    component: () => import('@/views/order/SellerOrderList.vue'),
    meta: { title: '卖家订单', requireAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/order/TransactionList.vue'),
    meta: { title: '交易记录', requireAuth: true }
  },
  {
    path: '/admin/feedback',
    name: 'FeedbackManagement',
    component: () => import('@/views/admin/FeedbackManagement.vue'),
    meta: { title: '反馈管理', requireAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/UserCenter.vue'),
    meta: { title: '个人中心', requireAuth: true }
  },
  {
    path: '/user/favorites',
    name: 'UserFavorites',
    component: () => import('@/views/user/UserFavorites.vue'),
    meta: { title: '我的收藏', requireAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { title: '后台管理', requireAuth: true, requireAdmin: true }
  },
  {
    path: '/admin/registrations',
    name: 'AdminRegistrations',
    component: () => import('@/views/admin/RegistrationList.vue'),
    meta: { title: '报名信息查询', requireAuth: true, requireAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 浙江畲族文化交流与交易平台` : '浙江畲族文化交流与交易平台'
  
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  
  if (to.meta.requireAuth && !token) {
    next('/login')
  } else if (to.meta.requireAdmin && userInfo.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
