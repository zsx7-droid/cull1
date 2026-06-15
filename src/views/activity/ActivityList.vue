<template>
  <div class="activity-list">
    <Header />
    
    <div class="container">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部活动" name="all" />
          <el-tab-pane label="即将开始" name="upcoming" />
          <el-tab-pane label="往期活动" name="past" />
        </el-tabs>
      </div>
      
      <!-- 活动列表 -->
      <div class="activity-grid" v-loading="loading">
        <el-row :gutter="20" v-if="activityList.length">
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            v-for="item in activityList"
            :key="item.id"
          >
            <el-card class="activity-card" shadow="hover" @click="goToDetail(item.id)">
              <div class="card-image">
                <img :src="item.images?.[0] || ''" :alt="item.title" />
              </div>
              
              <div class="card-content">
                <h3 class="card-title">{{ item.title }}</h3>
                
                <div class="meta-list">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ formatTime(item.time) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Location /></el-icon>
                    <span>{{ item.location || '待定' }}</span>
                  </div>
                </div>
                
                <p class="card-desc">{{ item.content }}</p>
                
                <div class="card-footer">
                  <span class="meta-info">
                    <el-icon><User /></el-icon> {{ item.authorName }}
                  </span>
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="goToDetail(item.id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-empty v-else-if="!loading" description="暂无活动" />
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getActivityList } from '@/api/activity'

const router = useRouter()

const activeTab = ref('all')
const activityList = ref([])
const loading = ref(false)

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const loadActivities = async () => {
  loading.value = true
  try {
    const typeMap = {
      'all': undefined,
      'upcoming': 'upcoming',
      'past': 'past'
    }
    const res = await getActivityList(typeMap[activeTab.value])
    activityList.value = res.data
  } catch (error) {
    console.error('加载活动列表失败:', error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
}

onMounted(() => {
  loadActivities()
})

watch(activeTab, () => {
  loadActivities()
})
</script>

<style scoped lang="scss">
.activity-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filter-bar {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.activity-grid {
  min-height: 300px;
  
  .activity-card {
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(200, 29, 37, 0.15);
    }
    
    :deep(.el-card__body) {
      padding: 0;
    }
    
    .card-image {
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 4px 4px 0 0;
      }
    }
    
    .card-content {
      padding: 15px;
      
      .card-title {
        font-size: 16px;
        color: #333;
        margin-bottom: 12px;
        font-weight: bold;
      }
      
      .meta-list {
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #666;
          margin-bottom: 5px;
        }
      }
      
      .card-desc {
        font-size: 14px;
        color: #999;
        line-height: 1.6;
        margin: 10px 0;
        height: 45px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        border-top: 1px solid #eee;
        
        .meta-info {
          font-size: 13px;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}
</style>
