<template>
  <div class="user-favorites">
    <Header />
    
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">我的收藏</span>
          </div>
        </template>
        
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="favorites.length === 0" class="empty">
          <el-empty description="暂无收藏内容" />
        </div>
        
        <div v-else class="post-list">
          <div class="post-item" v-for="post in favorites" :key="post.id">
            <div class="post-info" @click="goToDetail(post.id)">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-meta">
                <el-avatar :src="post.authorAvatar" :size="24" />
                <span class="author-name">{{ post.authorName }}</span>
                <span class="divider">·</span>
                <span>{{ post.category }}</span>
                <span class="divider">·</span>
                <span>{{ post.likeCount || 0 }} 点赞</span>
                <span class="divider">·</span>
                <span>收藏于 {{ formatTime(post.favoritedAt) }}</span>
              </div>
            </div>
            <el-button type="danger" size="small" @click.stop="cancelFavorite(post.id)">
              取消收藏
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFavorites } from '@/api/user'
import { toggleFavorite } from '@/api/forum'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const favorites = ref([])
const loading = ref(false)

const loadFavorites = async () => {
  loading.value = true
  try {
    const res = await getFavorites(userStore.userInfo.id)
    favorites.value = res.data
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/forum/${id}`)
}

const cancelFavorite = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await toggleFavorite({
      targetId: postId,
      targetType: 'post',
      userId: userStore.userInfo.id
    })
    
    favorites.value = favorites.value.filter(f => f.id !== postId)
    ElMessage.success('已取消收藏')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
    }
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  
  if (days < 1) return '今天'
  if (days < 7) return days + '天前'
  if (days < 30) return Math.floor(days / 7) + '周前'
  if (days < 365) return Math.floor(days / 30) + '月前'
  return Math.floor(days / 365) + '年前'
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped lang="scss">
.user-favorites {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.loading, .empty {
  padding: 40px 0;
}

.post-list {
  .post-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .post-info {
      flex: 1;
      cursor: pointer;
      
      &:hover .post-title {
        color: #C81D25;
      }
      
      .post-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        transition: color 0.3s;
      }
      
      .post-meta {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #999;
        
        .author-name {
          margin-left: 8px;
          margin-right: 8px;
        }
        
        .divider {
          margin: 0 8px;
        }
      }
    }
  }
}
</style>
