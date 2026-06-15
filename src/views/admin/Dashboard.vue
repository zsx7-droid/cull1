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
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
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
                    <div class="stat-value">{{ statistics.userCount }}</div>
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
                    <div class="stat-value">{{ statistics.cultureCount }}</div>
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
                    <div class="stat-value">{{ statistics.productCount }}</div>
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
                    <div class="stat-value">{{ statistics.orderCount }}</div>
                    <div class="stat-label">订单数量</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 图表区域 -->
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card>
                  <h4>用户增长趋势</h4>
                  <div class="chart-placeholder">
                    <p>图表区域（可集成 ECharts）</p>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card>
                  <h4>交易统计</h4>
                  <div class="chart-placeholder">
                    <p>图表区域（可集成 ECharts）</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 最近动态 -->
            <el-card style="margin-top: 20px;">
              <h4>最近动态</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :timestamp="activity.time"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeMenu = ref('dashboard')

// 统计数据
const statistics = ref({
  userCount: 1234,
  cultureCount: 156,
  productCount: 289,
  orderCount: 567
})

// 最近动态
const recentActivities = ref([
  { time: '2024-01-15 14:30', content: '新用户注册：张三' },
  { time: '2024-01-15 13:20', content: '新订单产生：订单号 202401150001' },
  { time: '2024-01-15 10:15', content: '新增文化资源：畲族银饰制作工艺' },
  { time: '2024-01-14 16:45', content: '新商品上架：畲族彩带手工编织包' },
  { time: '2024-01-14 09:30', content: '新活动发布：畲族三月三文化节' }
])

// 计算属性
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
      
      .chart-placeholder {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
      }
    }
  }
}
</style>
