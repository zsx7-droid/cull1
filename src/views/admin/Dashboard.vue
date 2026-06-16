<template>
  <div class="admin-dashboard">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <div class="logo"><h3>后台管理系统</h3></div>
        <el-menu :default-active="activeMenu" @select="handleMenuSelect" background-color="#1E3A8A" text-color="#fff" active-text-color="#F59E0B">
          <el-menu-item index="dashboard"><el-icon><DataLine /></el-icon><span>数据概览</span></el-menu-item>
          <el-sub-menu index="culture">
            <template #title><el-icon><Document /></el-icon><span>文化管理</span></template>
            <el-menu-item index="culture-list">文化列表</el-menu-item>
            <el-menu-item index="culture-add">添加文化</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="user-list"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
          <el-sub-menu index="product">
            <template #title><el-icon><Goods /></el-icon><span>商品管理</span></template>
            <el-menu-item index="product-list">商品列表</el-menu-item>
            <el-menu-item index="order-list">订单管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="activity">
            <template #title><el-icon><Calendar /></el-icon><span>活动管理</span></template>
            <el-menu-item index="activity-list">活动列表</el-menu-item>
            <el-menu-item index="registration-list">报名查询</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="post-list"><el-icon><ChatDotRound /></el-icon><span>帖子管理</span></el-menu-item>
          <el-menu-item index="feedback-list"><el-icon><Warning /></el-icon><span>反馈管理</span></el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/"><el-breadcrumb-item>首页</el-breadcrumb-item><el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item></el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown>
              <div class="user-info"><el-avatar :size="32" /><span>管理员</span></div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/')">返回前台</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content">
          <!-- ========== 数据概览 ========== -->
          <div v-if="activeMenu === 'dashboard'" class="dashboard-content">
            <el-row :gutter="20">
              <el-col :span="6" v-for="card in overviewCards" :key="card.label">
                <el-card class="stat-card">
                  <div class="stat-icon" :style="{ background: card.color }"><el-icon><component :is="card.icon" /></el-icon></div>
                  <div class="stat-info">
                    <div class="stat-value">{{ card.prefix || '' }}{{ card.value }}</div>
                    <div class="stat-label">{{ card.label }}</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top:20px">
              <el-col :span="12">
                <el-card>
                  <template #header><span>订单状态分布</span></template>
                  <div class="order-stats">
                    <div class="order-stat-item" v-for="s in orderStatusList" :key="s.key">
                      <el-tag :type="s.type" size="large">{{ s.label }}</el-tag>
                      <span class="order-stat-num">{{ orderStats[s.key] || 0 }}</span>
                    </div>
                  </div>
                  <div class="order-total">订单总额：<strong>¥{{ orderStats.totalAmount || 0 }}</strong></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header><span>热门商品 TOP5</span></template>
                  <el-table :data="topProducts" stripe size="small">
                    <el-table-column prop="name" label="商品名称" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column prop="price" label="价格" width="80"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
                    <el-table-column prop="sales" label="销量" width="80" />
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
            <el-card style="margin-top:20px">
              <template #header><span>最近订单</span></template>
              <el-table :data="recentOrders" stripe size="small">
                <el-table-column prop="orderNo" label="订单号" />
                <el-table-column prop="buyerName" label="买家" width="100" />
                <el-table-column label="金额" width="80"><template #default="{row}">¥{{ row.totalAmount }}</template></el-table-column>
                <el-table-column label="状态" width="80"><template #default="{row}"><el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag></template></el-table-column>
                <el-table-column label="时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
              </el-table>
            </el-card>
          </div>

          <!-- ========== 文化列表 ========== -->
          <div v-else-if="activeMenu === 'culture-list'">
            <el-table :data="cultureList" stripe v-loading="loading">
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="type" label="类型" width="100"><template #default="{row}"><el-tag size="small">{{ row.type }}</el-tag></template></el-table-column>
              <el-table-column prop="authorName" label="作者" width="100" />
              <el-table-column label="时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{row}"><el-popconfirm title="确定删除？" @confirm="deleteCulture(row.id)"><template #reference><el-button type="danger" size="small" text>删除</el-button></template></el-popconfirm></template>
              </el-table-column>
            </el-table>
          </div>

          <!-- ========== 添加文化 ========== -->
          <div v-else-if="activeMenu === 'culture-add'">
            <el-card>
              <el-form :model="cultureForm" label-width="80px">
                <el-form-item label="标题"><el-input v-model="cultureForm.title" /></el-form-item>
                <el-form-item label="类型">
                  <el-select v-model="cultureForm.type"><el-option label="历史" value="history" /><el-option label="文化" value="culture" /><el-option label="艺术" value="art" /><el-option label="民俗" value="folk" /></el-select>
                </el-form-item>
                <el-form-item label="内容"><el-input v-model="cultureForm.content" type="textarea" :rows="6" /></el-form-item>
                <el-form-item><el-button type="primary" @click="submitCulture" :loading="loading">发布</el-button></el-form-item>
              </el-form>
            </el-card>
          </div>

          <!-- ========== 用户管理 ========== -->
          <div v-else-if="activeMenu === 'user-list'">
            <el-table :data="userList" stripe v-loading="loading">
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="nickname" label="昵称" width="120" />
              <el-table-column prop="phone" label="手机号" width="130" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="role" label="角色" width="80"><template #default="{row}"><el-tag :type="row.role==='admin'?'danger':''" size="small">{{ row.role==='admin'?'管理员':'用户' }}</el-tag></template></el-table-column>
              <el-table-column label="注册时间" width="180"><template #default="{row}">{{ fmtTime(row.createdAt) }}</template></el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{row}">
                  <el-popconfirm v-if="row.role!=='admin'" title="确定删除该用户？" @confirm="deleteUser(row.id)"><template #reference><el-button type="danger" size="small" text>删除</el-button></template></el-popconfirm>
                  <span v-else style="color:#999;font-size:12px">—</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- ========== 商品列表 ========== -->
          <div v-else-if="activeMenu === 'product-list'">
            <el-table :data="productList" stripe v-loading="loading">
              <el-table-column label="图片" width="80"><template #default="{row}"><el-image :src="row.images?.[0]" style="width:50px;height:50px" fit="cover" /></template></el-table-column>
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="category" label="分类" width="120" />
              <el-table-column label="价格" width="80"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
              <el-table-column prop="stock" label="库存" width="70" />
              <el-table-column prop="sales" label="销量" width="70" />
              <el-table-column prop="sellerName" label="卖家" width="100" />
              <el-table-column label="时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
            </el-table>
          </div>

          <!-- ========== 订单管理 ========== -->
          <div v-else-if="activeMenu === 'order-list'">
            <el-table :data="allOrders" stripe v-loading="loading">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column prop="buyerName" label="买家" width="100" />
              <el-table-column label="商品" min-width="150"><template #default="{row}">{{ row.items?.map(i=>i.productName).join(', ') }}</template></el-table-column>
              <el-table-column label="金额" width="80"><template #default="{row}">¥{{ row.totalAmount }}</template></el-table-column>
              <el-table-column label="状态" width="90"><template #default="{row}"><el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag></template></el-table-column>
              <el-table-column label="支付方式" width="90"><template #default="{row}">{{ payText(row.paymentMethod) }}</template></el-table-column>
              <el-table-column label="创建时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
            </el-table>
          </div>

          <!-- ========== 活动列表 ========== -->
          <div v-else-if="activeMenu === 'activity-list'">
            <el-table :data="activityList" stripe v-loading="loading">
              <el-table-column prop="title" label="活动名称" />
              <el-table-column prop="location" label="地点" width="180" />
              <el-table-column prop="time" label="活动时间" width="180" />
              <el-table-column prop="authorName" label="发布者" width="100" />
              <el-table-column label="操作" width="80">
                <template #default="{row}"><el-popconfirm title="确定删除？" @confirm="deleteActivity(row.id)"><template #reference><el-button type="danger" size="small" text>删除</el-button></template></el-popconfirm></template>
              </el-table-column>
            </el-table>
          </div>

          <!-- ========== 帖子管理 ========== -->
          <div v-else-if="activeMenu === 'post-list'">
            <el-table :data="postList" stripe v-loading="loading">
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="category" label="分类" width="100"><template #default="{row}"><el-tag size="small">{{ row.category }}</el-tag></template></el-table-column>
              <el-table-column prop="authorName" label="作者" width="100" />
              <el-table-column prop="views" label="浏览" width="70" />
              <el-table-column label="时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{row}"><el-popconfirm title="确定删除？" @confirm="deletePost(row.id)"><template #reference><el-button type="danger" size="small" text>删除</el-button></template></el-popconfirm></template>
              </el-table-column>
            </el-table>
          </div>

          <!-- ========== 反馈管理 ========== -->
          <div v-else-if="activeMenu === 'feedback-list'">
            <el-table :data="feedbackList" stripe v-loading="loading">
              <el-table-column prop="username" label="用户" width="120" />
              <el-table-column prop="type" label="类型" width="100"><template #default="{row}"><el-tag size="small">{{ feedbackTypeText(row.type) }}</el-tag></template></el-table-column>
              <el-table-column prop="content" label="内容" />
              <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="row.status==='pending'?'warning':'success'" size="small">{{ row.status==='pending'?'待处理':'已处理' }}</el-tag></template></el-table-column>
              <el-table-column label="时间" width="180"><template #default="{row}">{{ fmtTime(row.createTime) }}</template></el-table-column>
            </el-table>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('dashboard')
const loading = ref(false)

// ========== 概览数据 ==========
const overview = ref({})
const orderStats = ref({})
const topProducts = ref([])
const recentOrders = ref([])

const overviewCards = computed(() => [
  { label: '用户总数', value: overview.value.userCount || 0, color: '#409EFF', icon: 'User' },
  { label: '文化资源', value: overview.value.cultureCount || 0, color: '#67C23A', icon: 'Document' },
  { label: '商品数量', value: overview.value.productCount || 0, color: '#E6A23C', icon: 'Goods' },
  { label: '订单数量', value: overview.value.orderCount || 0, color: '#F56C6C', icon: 'ShoppingCart' },
  { label: '论坛帖子', value: overview.value.postCount || 0, color: '#9B59B6', icon: 'ChatDotRound' },
  { label: '文化活动', value: overview.value.activityCount || 0, color: '#1ABC9C', icon: 'Calendar' },
  { label: '用户反馈', value: overview.value.feedbackCount || 0, color: '#E74C3C', icon: 'Warning' },
  { label: '总营收', value: overview.value.totalRevenue || 0, color: '#F39C12', icon: 'Money', prefix: '¥' }
])

const orderStatusList = [
  { key: 'pending', label: '待付款', type: 'warning' },
  { key: 'paid', label: '已付款', type: 'success' },
  { key: 'completed', label: '已完成', type: 'info' },
  { key: 'cancelled', label: '已取消', type: 'danger' }
]

// ========== 各模块数据 ==========
const cultureList = ref([])
const userList = ref([])
const productList = ref([])
const allOrders = ref([])
const activityList = ref([])
const postList = ref([])
const feedbackList = ref([])

const cultureForm = ref({ title: '', type: 'culture', content: '' })

// ========== 加载函数 ==========
const loadDashboard = async () => {
  const [r1, r2, r3, r4] = await Promise.all([
    request.get('/admin/overview').catch(() => null),
    request.get('/admin/orders/statistics').catch(() => null),
    request.get('/admin/products/top', { params: { limit: 5 } }).catch(() => null),
    request.get('/admin/orders/recent', { params: { limit: 10 } }).catch(() => null)
  ])
  if (r1) overview.value = r1.data
  if (r2) orderStats.value = r2.data
  if (r3) topProducts.value = r3.data
  if (r4) recentOrders.value = r4.data
}

const loadCultures = async () => {
  loading.value = true
  try { const r = await request.get('/cultures'); cultureList.value = r.data || [] } catch(e) {}
  loading.value = false
}

const loadUsers = async () => {
  loading.value = true
  try { const r = await request.get('/admin/users'); userList.value = r.data || [] } catch(e) {}
  loading.value = false
}

const loadProducts = async () => {
  loading.value = true
  try { const r = await request.get('/shop/products', { params: { size: 100 } }); productList.value = r.data?.list || [] } catch(e) {}
  loading.value = false
}

const loadOrders = async () => {
  loading.value = true
  try { const r = await request.get('/admin/orders'); allOrders.value = r.data || [] } catch(e) {}
  loading.value = false
}

const loadActivities = async () => {
  loading.value = true
  try { const r = await request.get('/activities'); activityList.value = r.data || [] } catch(e) {}
  loading.value = false
}

const loadPosts = async () => {
  loading.value = true
  try { const r = await request.get('/forum/posts', { params: { size: 100 } }); postList.value = r.data?.list || [] } catch(e) {}
  loading.value = false
}

const loadFeedbacks = async () => {
  loading.value = true
  try { const r = await request.get('/feedbacks'); feedbackList.value = r.data || [] } catch(e) {}
  loading.value = false
}

// ========== 操作函数 ==========
const userInfo = computed(() => userStore.userInfo)

const deleteCulture = async (id) => {
  try { await request.delete(`/culture/${id}`); ElMessage.success('删除成功'); loadCultures() } catch(e) {}
}

const deleteUser = async (id) => {
  try { await request.delete(`/admin/user/${id}`); ElMessage.success('删除成功'); loadUsers() } catch(e) {}
}

const deleteActivity = async (id) => {
  try { await request.delete(`/activity/${id}`); ElMessage.success('删除成功'); loadActivities() } catch(e) {}
}

const deletePost = async (id) => {
  try { await request.delete(`/forum/post/${id}`); ElMessage.success('删除成功'); loadPosts() } catch(e) {}
}

const submitCulture = async () => {
  if (!cultureForm.value.title || !cultureForm.value.content) { ElMessage.info('请填写完整'); return }
  loading.value = true
  try {
    await request.post('/culture', cultureForm.value)
    ElMessage.success('发布成功')
    cultureForm.value = { title: '', type: 'culture', content: '' }
    activeMenu.value = 'culture-list'
  } catch(e) {}
  loading.value = false
}

// ========== 菜单切换自动加载 ==========
const menuLoaders = {
  'dashboard': loadDashboard,
  'culture-list': loadCultures,
  'culture-add': null,
  'user-list': loadUsers,
  'product-list': loadProducts,
  'order-list': loadOrders,
  'activity-list': loadActivities,
  'post-list': loadPosts,
  'feedback-list': loadFeedbacks
}

watch(activeMenu, (val) => {
  const loader = menuLoaders[val]
  if (loader) loader()
})

onMounted(() => { loadDashboard() })

// ========== 工具函数 ==========
const statusType = (s) => ({ pending:'warning', paid:'success', completed:'info', cancelled:'danger' }[s] || 'info')
const statusText = (s) => ({ pending:'待付款', paid:'已付款', completed:'已完成', cancelled:'已取消' }[s] || s)
const payText = (m) => ({ wechat:'微信', alipay:'支付宝' }[m] || m || '—')
const feedbackTypeText = (t) => ({ bug:'Bug反馈', opinion:'意见建议', complaint:'投诉', other:'其他' }[t] || t)
const fmtTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : ''

const currentTitle = computed(() => ({
  'dashboard':'数据概览','culture-list':'文化列表','culture-add':'添加文化',
  'user-list':'用户管理','product-list':'商品列表','order-list':'订单管理',
  'activity-list':'活动列表','registration-list':'报名查询','post-list':'帖子管理',
  'feedback-list':'反馈管理'
}[activeMenu.value] || '数据概览'))

const handleMenuSelect = (key) => {
  if (key === 'registration-list') { router.push('/admin/registrations') }
  else { activeMenu.value = key }
}

const handleLogout = () => { userStore.logout(); router.push('/login') }
</script>

<style scoped lang="scss">
.admin-dashboard {
  height: 100vh;
  .sidebar {
    background: #1E3A8A;
    .logo { height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.1); h3 { color: white; font-size: 18px; } }
    .el-menu { border-right: none; }
  }
  .header {
    background: white; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
    .header-right .user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; span { font-size: 14px; } }
  }
  .main-content {
    background: #f5f7fa;
    .dashboard-content {
      .stat-card {
        display: flex; align-items: center; padding: 20px;
        .stat-icon { width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; .el-icon { font-size: 30px; color: white; } }
        .stat-info { flex: 1; .stat-value { font-size: 28px; font-weight: bold; color: #333; } .stat-label { font-size: 14px; color: #999; margin-top: 5px; } }
      }
      .order-stats { display: flex; justify-content: space-around; padding: 20px 0; .order-stat-item { text-align: center; .order-stat-num { display: block; font-size: 24px; font-weight: bold; margin-top: 8px; color: #333; } } }
      .order-total { text-align: center; padding: 15px 0; border-top: 1px solid #eee; color: #666; font-size: 15px; strong { color: #E6A23C; font-size: 18px; } }
    }
  }
}
</style>
