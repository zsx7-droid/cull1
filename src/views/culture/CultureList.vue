<template>
  <div class="culture-list">
    <Header />
    
    <div class="container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索畲族文化资源..."
          prefix-icon="Search"
          size="large"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 分类筛选 -->
      <div class="filter-bar">
        <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane label="文化介绍" name="culture" />
          <el-tab-pane label="传统习俗" name="custom" />
          <el-tab-pane label="民间艺术" name="art" />
          <el-tab-pane label="历史故事" name="history" />
        </el-tabs>
      </div>
      
      <!-- 文化列表 -->
      <div class="culture-grid" v-loading="loading">
        <el-row :gutter="20" v-if="cultureList.length">
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            v-for="item in cultureList"
            :key="item.id"
          >
            <el-card class="culture-card" shadow="hover" @click="goToDetail(item.id)">
              <div class="card-image-wrapper">
                <img :src="item.images?.[0] || ''" :alt="item.title" class="card-image" />
              </div>
              
              <div class="card-content">
                <el-tag size="small">
                  {{ getTypeName(item.type) }}
                </el-tag>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.content }}</p>
                
                <div class="card-footer">
                  <span class="meta-item">
                    <el-icon><User /></el-icon> {{ item.authorName }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon> {{ formatTime(item.createTime) }}
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-empty v-else-if="!loading" description="暂无文化内容" />
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
import { getCultures } from '@/api/culture'

const router = useRouter()

const keyword = ref('')
const activeCategory = ref('all')
const cultureList = ref([])
const allCultures = ref([])
const loading = ref(false)

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
  return new Date(time).toLocaleDateString('zh-CN')
}

const loadCultures = async () => {
  loading.value = true
  try {
    const res = await getCultures()
    allCultures.value = res.data
    filterCultures()
  } catch (error) {
    console.error('加载文化列表失败:', error)
  } finally {
    loading.value = false
  }
}

const filterCultures = () => {
  let list = [...allCultures.value]
  
  if (activeCategory.value !== 'all') {
    list = list.filter(item => item.type === activeCategory.value)
  }
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(item => 
      item.title.toLowerCase().includes(kw) || 
      item.content.toLowerCase().includes(kw)
    )
  }
  
  cultureList.value = list
}

const handleSearch = () => {
  filterCultures()
}

const handleCategoryChange = () => {
  filterCultures()
}

const goToDetail = (id) => {
  router.push(`/culture/${id}`)
}

onMounted(() => {
  loadCultures()
})
</script>

<style scoped lang="scss">
.culture-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.filter-bar {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.culture-grid {
  min-height: 300px;
  
  .culture-card {
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
    
    .card-image-wrapper {
      .card-image {
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
        margin: 10px 0;
        color: #333;
        font-weight: bold;
      }
      
      .card-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .card-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px solid #eee;
        
        .meta-item {
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
