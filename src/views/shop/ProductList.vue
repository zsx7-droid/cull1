<template>
  <div class="product-list">
    <Header />
    
    <div class="container">
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-input
          v-model="keyword"
          placeholder="搜索商品..."
          prefix-icon="Search"
          style="width: 300px"
          @keyup.enter="handleSearch"
        />
        
        <el-select v-model="categoryFilter" placeholder="分类" style="width: 150px" @change="loadProducts">
          <el-option label="全部" value="" />
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.name" />
        </el-select>
        
        <el-button type="primary" @click="router.push('/shop/publish')">发布商品</el-button>
      </div>
      
      <!-- 商品网格 -->
      <div class="product-grid" v-loading="loading">
        <el-row :gutter="20" v-if="productList.length">
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            v-for="item in productList"
            :key="item.id"
          >
            <el-card class="product-card" shadow="hover">
              <!-- 图片区域 -->
              <div class="image-wrapper">
                <img 
                  :src="item.images?.[0] || ''" 
                  :alt="item.name" 
                  class="product-image" 
                  @click="goToDetail(item.id)"
                />
                
                <div class="category-tag">
                  <el-tag size="small">{{ item.category }}</el-tag>
                </div>
                
                <div class="quick-actions" v-if="item.stock > 0">
                  <button class="action-btn" @click.stop="handleAddToCart(item)" title="加入购物车">
                    <el-icon><ShoppingCart /></el-icon>
                  </button>
                </div>
                
                <div v-if="!item.stock || item.stock === 0" class="sold-out-overlay">
                  <span>已售罄</span>
                </div>
              </div>
              
              <!-- 商品信息 -->
              <div class="product-info">
                <h3 class="product-name" @click="goToDetail(item.id)">{{ item.name }}</h3>
                <p class="product-desc">{{ item.description }}</p>
                
                <div class="price-row">
                  <span class="current-price">¥{{ item.price }}</span>
                </div>
                
                <div class="stats-row">
                  <span>库存: {{ item.stock || 0 }}</span>
                  <span>销量: {{ item.sales || 0 }}</span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="card-actions">
                <el-button type="primary" size="small" @click.stop="handleAddToCart(item)" :disabled="!item.stock">
                  {{ item.stock > 0 ? '加入购物车' : '已售罄' }}
                </el-button>
                <el-button size="small" @click="goToDetail(item.id)">
                  查看详情
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-empty v-else description="暂无商品" />
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[8, 12, 16, 24]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadProducts"
          @current-change="loadProducts"
        />
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
import { ElMessage } from 'element-plus'
import { View, ShoppingCart, Star } from '@element-plus/icons-vue'
import { getCategories, getProducts, addToCart } from '@/api/shop'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const keyword = ref('')
const categoryFilter = ref('')
const productList = ref([])
const categories = ref([
  { id: 1, name: '畲族服饰' },
  { id: 2, name: '畲族银饰' },
  { id: 3, name: '织彩带与布艺' },
  { id: 4, name: '竹编木艺工艺' },
  { id: 5, name: '特色食品茶饮' },
  { id: 6, name: '文创潮流周边' },
  { id: 7, name: '民俗节庆用品' }
])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const loading = ref(false)

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts({
      category: categoryFilter.value,
      keyword: keyword.value,
      page: currentPage.value,
      size: pageSize.value
    })
    productList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleAddToCart = async (product) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!product.stock) {
    ElMessage.warning('商品已售罄')
    return
  }
  
  try {
    await addToCart({
      productId: product.id,
      quantity: 1,
      userId: userInfo.id
    })
    userStore.setCartCount(userStore.cartCount + 1)
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

watch(categoryFilter, () => {
  currentPage.value = 1
  loadProducts()
})

onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.product-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.product-grid {
  min-height: 400px;
  
  .product-card {
    cursor: default;
    transition: all 0.3s;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(200, 29, 37, 0.15);
    }
    
    :deep(.el-card__body) {
      padding: 0;
      overflow: hidden;
    }
    
    .image-wrapper {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      
      .product-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      
      &:hover .product-image {
        transform: scale(1.08);
      }
      
      .category-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 1;
      }
      
      .quick-actions {
        position: absolute;
        bottom: -50px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 10px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        transition: bottom 0.3s ease;
        
        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            background: #C81D25;
            color: white;
            transform: scale(1.1);
          }
        }
      }
      
      &:hover .quick-actions {
        bottom: 0;
      }
      
      .sold-out-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        
        span {
          color: white;
          font-size: 24px;
          font-weight: bold;
          transform: rotate(-15deg);
          border: 3px solid white;
          padding: 10px 20px;
        }
      }
    }
    
    .product-info {
      padding: 15px;
      
      .product-name {
        font-size: 16px;
        color: #333;
        margin-bottom: 8px;
        font-weight: bold;
        height: 44px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        cursor: pointer;
        
        &:hover {
          color: #C81D25;
        }
      }
      
      .product-desc {
        font-size: 13px;
        color: #999;
        margin-bottom: 12px;
        line-height: 1.5;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .price-row {
        margin-bottom: 10px;
        
        .current-price {
          font-size: 24px;
          color: #C81D25;
          font-weight: bold;
        }
      }
      
      .stats-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #999;
        padding-top: 8px;
        border-top: 1px solid #f0f0f0;
      }
    }
    
    .card-actions {
      padding: 0 15px 15px;
      display: flex;
      gap: 10px;
      
      .el-button {
        flex: 1;
      }
    }
  }
}

.pagination {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
