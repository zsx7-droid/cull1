<template>
  <div class="spot-list">
    <Header />
    
    <div class="container">
      <h1 class="page-title">文旅推荐</h1>
      <p class="page-desc">探索畲族风情，体验文旅魅力</p>
      
      <el-tabs v-model="activeCategory" @tab-change="loadSpots">
        <el-tab-pane label="全部景点" name="all" />
        <el-tab-pane label="浙江景宁畲乡景点" name="浙江景宁畲乡景点" />
        <el-tab-pane label="民俗村寨" name="民俗村寨" />
        <el-tab-pane label="研学路线" name="研学路线" />
        <el-tab-pane label="文旅打卡" name="文旅打卡" />
      </el-tabs>
      
      <div v-if="loading" class="loading">
        <el-skeleton :rows="6" animated />
      </div>
      
      <div v-else-if="spotList.length === 0" class="empty">
        <el-empty description="暂无景点" />
      </div>
      
      <div v-else class="spot-grid">
        <el-card 
          v-for="spot in spotList" 
          :key="spot.id" 
          class="spot-card" 
          shadow="hover"
          @click="showDetail(spot)"
        >
          <img :src="spot.images?.[0]" :alt="spot.title" class="spot-image" />
          <div class="spot-content">
            <el-tag size="small" type="warning">{{ spot.category }}</el-tag>
            <h3 class="spot-title">{{ spot.title }}</h3>
            <p class="spot-location">
              <el-icon><Location /></el-icon>
              {{ spot.location }}
            </p>
            <p class="spot-desc">{{ spot.description?.substring(0, 60) }}...</p>
            <div class="spot-info">
              <span v-if="spot.ticketPrice > 0">
                <el-icon><Ticket /></el-icon>
                ¥{{ spot.ticketPrice }}
              </span>
              <span v-else>
                <el-icon><Ticket /></el-icon>
                免费
              </span>
              <span>
                <el-icon><Clock /></el-icon>
                {{ spot.openingHours }}
              </span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="currentSpot?.title" width="700px" destroy-on-close>
      <div class="spot-dialog" v-if="currentSpot">
        <img :src="currentSpot.images?.[0]" :alt="currentSpot.title" class="dialog-image" />
        <div class="dialog-info">
          <p><strong>分类：</strong>{{ currentSpot.category }}</p>
          <p><strong>地址：</strong>{{ currentSpot.location }}</p>
          <p><strong>开放时间：</strong>{{ currentSpot.openingHours }}</p>
          <p><strong>门票价格：</strong>{{ currentSpot.ticketPrice > 0 ? `¥${currentSpot.ticketPrice}` : '免费' }}</p>
          <p><strong>简介：</strong></p>
          <p class="description">{{ currentSpot.description }}</p>
          <div class="highlights" v-if="currentSpot.highlights?.length">
            <strong>特色亮点：</strong>
            <el-tag v-for="item in currentSpot.highlights" :key="item" size="small" type="success" style="margin: 5px">
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getSpots } from '@/api/spot'
import { Location, Ticket, Clock } from '@element-plus/icons-vue'

const router = useRouter()

const activeCategory = ref('all')
const spotList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentSpot = ref(null)

const loadSpots = async () => {
  loading.value = true
  try {
    const res = await getSpots(activeCategory.value)
    spotList.value = res.data || []
  } catch (error) {
    console.error('加载景点列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showDetail = (spot) => {
  currentSpot.value = spot
  dialogVisible.value = true
}

onMounted(() => {
  loadSpots()
})
</script>

<style scoped lang="scss">
.spot-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-title {
  text-align: center;
  font-size: 32px;
  color: #1E3A8A;
  margin-bottom: 10px;
}

.page-desc {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.spot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.spot-card {
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .spot-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .spot-content {
    padding: 15px;
    
    .spot-title {
      font-size: 18px;
      margin: 10px 0;
      color: #333;
    }
    
    .spot-location {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
    
    .spot-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    
    .spot-info {
      display: flex;
      gap: 20px;
      color: #1E3A8A;
      font-size: 14px;
      
      span {
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }
}

.spot-dialog {
  .dialog-image {
    width: 100%;
    max-height: 350px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .dialog-info {
    p {
      margin: 12px 0;
      line-height: 1.8;
      color: #555;
      
      strong {
        color: #1E3A8A;
        min-width: 90px;
        display: inline-block;
      }
    }
    
    .description {
      text-indent: 2em;
    }
    
    .highlights {
      margin-top: 15px;
      
      strong {
        display: block;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
