<template>
  <div class="admin-dashboard">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">
          <h3>后台管理系统</h3>
        </div>

        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          background-color="#1E3A8A"
          text-color="#fff"
          active-text-color="#F59E0B"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataLine /></el-icon>
            <span>数据概览</span>
          </el-menu-item>

          <el-sub-menu index="culture">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>文化资源管理</span>
            </template>
            <el-menu-item index="culture-list">文化列表</el-menu-item>
            <el-menu-item index="culture-add">添加文化</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="user-list">用户列表</el-menu-item>
            <el-menu-item index="inheritor-list">传承人管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="product">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="product-list">商品列表</el-menu-item>
            <el-menu-item index="order-list">订单管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="activity">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>活动管理</span>
            </template>
            <el-menu-item index="activity-list">活动列表</el-menu-item>
            <el-menu-item index="registration-list">报名查询</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="forum">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>论坛管理</span>
            </template>
            <el-menu-item index="post-list">帖子管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <el-dropdown>
              <div class="user-info">
                <el-avatar :size="32" />
                <span>管理员</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user')">个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区域 -->
        <el-main class="main-content">
          <!-- 数据概览 -->
          <div v-if="activeMenu === 'dashboard'" class="dashboard-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #409EFF;">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.userCount }}</div>
                    <div class="stat-label">用户总数</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #67C23A;">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.cultureCount }}</div>
                    <div class="stat-label">文化资源</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #E6A23C;">
                    <el-icon><Goods /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.productCount }}</div>
                    <div class="stat-label">商品数量</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #F56C6C;">
                    <el-icon><ShoppingCart /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.orderCount }}</div>
                    <div class="stat-label">订单数量</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 第二行统计卡片 -->
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #9B59B6;">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.postCount }}</div>
                    <div class="stat-label">论坛帖子</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #1ABC9C;">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.activityCount }}</div>
                    <div class="stat-label">文化活动</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #E74C3C;">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ overview.feedbackCount }}</div>
                    <div class="stat-label">用户反馈</div>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-icon" style="background: #F39C12;">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">¥{{ overview.totalRevenue }}</div>
                    <div class="stat-label">总营收</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 订单统计 + 热门商品 -->
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>订单状态分布</span>
                  </template>
                  <div class="order-stats">
                    <div class="order-stat-item">
                      <el-tag type="warning">待付款</el-tag>
                      <span class="order-stat-num">{{ orderStats.pending }}</span>
                    </div>
                    <div class="order-stat-item">
                      <el-tag type="success">已付款</el-tag>
                      <span class="order-stat-num">{{ orderStats.paid }}</span>
                    </div>
                    <div class="order-stat-item">
                      <el-tag type="info">已完成</el-tag>
                      <span class="order-stat-num">{{ orderStats.completed }}</span>
                    </div>
                    <div class="order-stat-item">
                      <el-tag type="danger">已取消</el-tag>
                      <span class="order-stat-num">{{ orderStats.cancelled }}</span>
                    </div>
                  </div>
                  <div class="order-total">
                    订单总额：<strong>¥{{ orderStats.totalAmount }}</strong>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>热门商品 TOP5</span>
                  </template>
                  <el-table :data="topProducts" stripe size="small">
                    <el-table-column prop="name" label="商品名称" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column prop="price" label="价格" width="80">
                      <template #default="{ row }">¥{{ row.price }}</template>
                    </el-table-column>
                    <el-table-column prop="sales" label="销量" width="80" />
                  </el-table>
                </el-card>
              </el-col>
            </el-row>

            <!-- 最近订单 -->
            <el-card style="margin-top: 20px;">
              <template #header>
                <span>最近订单</span>
              </template>
              <el-table :data="recentOrders" stripe size="small">
                <el-table-column prop="orderNo" label="订单号" />
                <el-table-column prop="buyerName" label="买家" width="100" />
                <el-table-column prop="totalAmount" label="金额" width="80">
                  <template #default="{ row }">¥{{ row.totalAmount }}</template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                  <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <!-- 其他菜单内容占位 -->
          <div v-else>
            <el-alert
              :title="`${currentTitle} - 功能开发中`"
              type="info"
              :closable="false"
            />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('dashboard')

const overview = ref({
  userCount: 0,
  cultureCount: 0,
  productCount: 0,
  orderCount: 0,
  postCount: 0,
  feedbackCount: 0,
  activityCount: 0,
  totalRevenue: 0
})

const orderStats = ref({
  totalOrders: 0,
  totalAmount: 0,
  pending: 0,
  paid: 0,
  completed: 0,
  cancelled: 0
})

const topProducts = ref([])
const recentOrders = ref([])

const loadOverview = async () => {
  try {
    const res = await request.get('/admin/overview')
    overview.value = res.data
  } catch (e) {
    console.error('加载概览失败:', e)
  }
}

const loadOrderStats = async () => {
  try {
    const res = await request.get('/admin/orders/statistics')
    orderStats.value = res.data
  } catch (e) {
    console.error('加载订单统计失败:', e)
  }
}

const loadTopProducts = async () => {
  try {
    const res = await request.get('/admin/products/top', { params: { limit: 5 } })
    topProducts.value = res.data
  } catch (e) {
    console.error('加载热门商品失败:', e)
  }
}

const loadRecentOrders = async () => {
  try {
    const res = await request.get('/admin/orders/recent', { params: { limit: 10 } })
    recentOrders.value = res.data
  } catch (e) {
    console.error('加载最近订单失败:', e)
  }
}

onMounted(() => {
  loadOverview()
  loadOrderStats()
  loadTopProducts()
  loadRecentOrders()
})

const statusType = (status) => {
  const map = { pending: 'warning', paid: 'success', completed: 'info', cancelled: 'danger' }
  return map[status] || 'info'
}

const statusText = (status) => {
  const map = { pending: '待付款', paid: '已付款', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const currentTitle = computed(() => {
  const map = {
    'dashboard': '数据概览',
    'culture-list': '文化列表',
    'culture-add': '添加文化',
    'user-list': '用户列表',
    'inheritor-list': '传承人管理',
    'product-list': '商品列表',
    'order-list': '订单管理',
    'activity-list': '活动列表',
    'registration-list': '报名查询',
    'post-list': '帖子管理',
    'statistics': '数据统计'
  }
  return map[activeMenu.value] || '数据概览'
})

const handleMenuSelect = (key) => {
  const routeMap = {
    'registration-list': '/admin/registrations'
  }
  if (routeMap[key]) {
    router.push(routeMap[key])
  } else {
    activeMenu.value = key
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-dashboard {
  height: 100vh;

  .sidebar {
    background: #1E3A8A;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h3 {
        color: white;
        font-size: 18px;
      }
    }

    .el-menu {
      border-right: none;
    }
  }

  .header {
    background: white;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        span {
          font-size: 14px;
        }
      }
    }
  }

  .main-content {
    background: #f5f7fa;

    .dashboard-content {
      .stat-card {
        display: flex;
        align-items: center;
        padding: 20px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;

          .el-icon {
            font-size: 30px;
            color: white;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
          }

          .stat-label {
            font-size: 14px;
            color: #999;
            margin-top: 5px;
          }
        }
      }

      .order-stats {
        display: flex;
        justify-content: space-around;
        padding: 20px 0;

        .order-stat-item {
          text-align: center;

          .order-stat-num {
            display: block;
            font-size: 24px;
            font-weight: bold;
            margin-top: 8px;
            color: #333;
          }
        }
      }

      .order-total {
        text-align: center;
        padding: 15px 0;
        border-top: 1px solid #eee;
        color: #666;
        font-size: 15px;

        strong {
          color: #E6A23C;
          font-size: 18px;
        }
      }
    }
  }
}
</style>
