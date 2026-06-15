<template>
  <div class="culture-detail">
    <Header />
    
    <div class="container">
      <el-card class="detail-card" v-loading="loading">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/culture' }">文化展示</el-breadcrumb-item>
          <el-breadcrumb-item>{{ detail.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 标题区 -->
        <div class="title-section">
          <h1 class="main-title">{{ detail.title }}</h1>
          <div class="meta-info">
            <el-tag>{{ getTypeName(detail.type) }}</el-tag>
            <span class="meta-item">
              <el-icon><Clock /></el-icon> {{ formatTime(detail.createTime) }}
            </span>
            <span class="meta-item">
              <el-icon><User /></el-icon> {{ detail.authorName }}
            </span>
          </div>
        </div>
        
        <!-- 封面图 -->
        <div class="media-section">
          <img :src="detail.images?.[0] || ''" alt="封面" />
        </div>
        
        <!-- 内容区 -->
        <div class="content-section">
          <p>{{ detail.content }}</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button v-if="isAdmin()" type="danger" @click="handleDelete">删除</el-button>
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
import { getCultureDetail, deleteCulture } from '@/api/culture'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref({
  id: '',
  title: '',
  content: '',
  type: 'culture',
  images: [],
  authorId: '',
  authorName: '',
  createTime: ''
})

const getTypeName = (type) => {
  const map = {
    'culture': '文化介绍',
    'custom': '传统习俗',
    'art': '民间艺术',
    'history': '历史故事'
  }
  return map[type] || '文化介绍'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getCultureDetail(route.params.id)
    detail.value = res.data
  } catch (error) {
    console.error('加载文化详情失败:', error)
    ElMessage.info('加载失败')
  } finally {
    loading.value = false
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
    await ElMessageBox.confirm('确定要删除这篇文化内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteCulture(detail.value.id, userInfo.id)
    ElMessage.success('删除成功')
    router.push('/culture')
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
.culture-detail {
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
  
  p {
    white-space: pre-wrap;
  }
}

.action-section {
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
