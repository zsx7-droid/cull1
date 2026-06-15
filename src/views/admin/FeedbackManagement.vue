<template>
  <div class="feedback-management">
    <Header />
    
    <div class="container">
      <h2 class="page-title">反馈管理</h2>
      
      <div class="feedbacks" v-loading="loading">
        <el-card v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
          <div class="feedback-header">
            <div class="user-info">
              <el-avatar :size="40">{{ feedback.nickname?.[0] || feedback.username?.[0] || '?' }}</el-avatar>
              <div class="user-detail">
                <span class="username">{{ feedback.nickname || feedback.username }}</span>
                <span class="time">{{ formatTime(feedback.createTime) }}</span>
              </div>
            </div>
            <el-tag :type="getFeedbackTypeTag(feedback.type)">
              {{ getFeedbackTypeText(feedback.type) }}
            </el-tag>
          </div>
          
          <div class="feedback-content">{{ feedback.content }}</div>
          
          <div class="feedback-footer">
            <el-tag :type="feedback.status === 'pending' ? 'warning' : 'success'" size="small">
              {{ feedback.status === 'pending' ? '待处理' : '已处理' }}
            </el-tag>
            <el-button v-if="feedback.status === 'pending'" type="primary" size="small" @click="handleProcess(feedback)">
              标记已处理
            </el-button>
          </div>
        </el-card>
        
        <el-empty v-if="feedbacks.length === 0 && !loading" description="暂无反馈记录" />
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { getAllFeedbacks } from '@/api/feedback'

const router = useRouter()
const feedbacks = ref([])
const loading = ref(false)

const loadFeedbacks = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id || userInfo.role !== 'admin') {
    ElMessage.warning('无权访问')
    router.push('/')
    return
  }
  
  loading.value = true
  try {
    const res = await getAllFeedbacks()
    feedbacks.value = res.data || []
  } catch (error) {
    console.error('加载反馈列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getFeedbackTypeText = (type) => {
  const map = {
    'opinion': '用户意见',
    'suggestion': '平台建议',
    'complaint': '问题投诉'
  }
  return map[type] || type
}

const getFeedbackTypeTag = (type) => {
  const map = {
    'opinion': '',
    'suggestion': 'success',
    'complaint': 'danger'
  }
  return map[type] || ''
}

const handleProcess = (feedback) => {
  feedback.status = 'processed'
}

onMounted(() => {
  loadFeedbacks()
})
</script>

<style scoped lang="scss">
.feedback-management {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-title {
  text-align: center;
  font-size: 28px;
  color: #1E3A8A;
  margin-bottom: 10px;
}

.page-desc {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.feedbacks {
  .feedback-card {
    margin-bottom: 15px;
    
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .user-detail {
          display: flex;
          flex-direction: column;
          
          .username {
            font-weight: bold;
            color: #333;
          }
          
          .time {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
    
    .feedback-content {
      color: #333;
      line-height: 1.8;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    
    .feedback-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
