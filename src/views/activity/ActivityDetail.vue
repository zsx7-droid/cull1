<template>
  <div class="activity-detail">
    <Header />
    
    <div class="container">
      <el-card class="detail-card" v-loading="loading">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/activity' }">文化活动</el-breadcrumb-item>
          <el-breadcrumb-item>{{ activity.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 标题区 -->
        <div class="title-section">
          <h1 class="main-title">{{ activity.title }}</h1>
          <div class="meta-info">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon> {{ formatTime(activity.time) }}
            </span>
            <span class="meta-item">
              <el-icon><Location /></el-icon> {{ activity.location || '待定' }}
            </span>
            <span class="meta-item">
              <el-icon><User /></el-icon> {{ activity.authorName }}
            </span>
          </div>
        </div>
        
        <!-- 封面图 -->
        <div class="media-section">
          <img :src="activity.images?.[0] || ''" alt="封面" />
        </div>
        
        <!-- 内容区 -->
        <div class="content-section">
          <h3>活动详情</h3>
          <p>{{ activity.content }}</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button
            v-if="!isAdmin() && !isRegistered"
            type="primary"
            size="large"
            @click="handleRegister"
          >
            立即报名
          </el-button>
          <el-button
            v-if="isRegistered"
            type="info"
            size="large"
            disabled
          >
            已报名
          </el-button>
          <el-button
            v-if="isAdmin()"
            type="danger"
            size="large"
            @click="handleDelete"
          >
            删除活动
          </el-button>
        </div>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivityDetail, deleteActivity, registerActivity } from '@/api/activity'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const isRegistered = ref(false)
const activity = ref({
  id: '',
  title: '',
  content: '',
  location: '',
  time: '',
  images: [],
  authorId: '',
  authorName: '',
  createTime: ''
})

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getActivityDetail(route.params.id)
    activity.value = res.data
    checkRegistration()
  } catch (error) {
    console.error('加载活动详情失败:', error)
    ElMessage.info('加载失败')
  } finally {
    loading.value = false
  }
}

const checkRegistration = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) return
  
  try {
    const res = await fetch(`/api/registrations?activityId=${activity.value.id}`)
    const data = await res.json()
    console.log('报名状态检查:', data)
    if (data.code === 200) {
      isRegistered.value = data.data.some(r => r.userId == userInfo.id)
    }
  } catch (error) {
    console.error('检查报名状态失败:', error)
  }
}

const handleRegister = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!userInfo.phone) {
    ElMessage.warning('请先在个人中心完善手机号信息')
    return
  }
  
  try {
    const params = {
      activityId: activity.value.id,
      activityTitle: activity.value.title,
      userId: userInfo.id,
      userName: userInfo.username,
      phone: userInfo.phone
    }
    console.log('报名参数:', params)
    await registerActivity(params)
    ElMessage.success('报名成功')
    checkRegistration()
  } catch (error) {
    console.error('报名失败:', error)
    const msg = error.response?.data?.message || error.message || '报名失败'
    ElMessage.info(msg)
  }
}

const handleDelete = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (userInfo.role !== 'admin') {
    ElMessage.warning('只有管理员才能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteActivity(activity.value.id, userInfo.id)
    ElMessage.success('删除成功')
    router.push('/activity')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.info(error.response?.data?.message || '删除失败')
    }
  }
}

const isAdmin = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.role === 'admin'
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped lang="scss">
.activity-detail {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.detail-card {
  :deep(.el-card__body) {
    padding: 30px;
  }
}

.title-section {
  margin-bottom: 20px;
  
  .main-title {
    font-size: 28px;
    color: #333;
    margin-bottom: 15px;
  }
  
  .meta-info {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #999;
      font-size: 14px;
    }
  }
}

.media-section {
  margin-bottom: 20px;
  
  img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.content-section {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 30px;
  
  h3 {
    margin-bottom: 15px;
  }
  
  p {
    white-space: pre-wrap;
  }
}

.action-section {
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
