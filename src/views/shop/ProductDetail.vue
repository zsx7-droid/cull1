<template>
  <div class="product-detail">
    <Header />
    
    <div class="container">
      <el-card class="detail-card" v-loading="loading">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/shop' }">文创商城</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name || '商品详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <div class="detail-content" v-if="product.name">
          <div class="image-section">
            <div class="main-image">
              <img :src="currentImage" :alt="product.name" />
            </div>
            <div class="thumbnail-list" v-if="product.images && product.images.length">
              <img
                v-for="(img, index) in product.images"
                :key="index"
                :src="img"
                alt=""
                :class="{ active: currentImage === img }"
                @click="currentImage = img"
              />
            </div>
          </div>
          
          <div class="info-section">
            <h1 class="product-name">{{ product.name }}</h1>
            <p class="product-desc">{{ product.description }}</p>
            
            <div class="price-box">
              <div class="price-label">价格</div>
              <div class="price-value">
                <span class="current-price">¥{{ product.price }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <span class="label">分类</span>
              <span class="value">{{ product.category }}</span>
            </div>
            
            <div class="info-row">
              <span class="label">库存</span>
              <span class="value">{{ product.stock }} 件</span>
            </div>
            
            <div class="info-row">
              <span class="label">销量</span>
              <span class="value">{{ product.sales || 0 }}</span>
            </div>
            
            <div class="info-row">
              <span class="label">卖家</span>
              <span class="value">{{ product.sellerName }}</span>
            </div>
            
            <div class="quantity-section">
              <span class="label">数量</span>
              <el-input-number v-model="quantity" :min="1" :max="product.stock" />
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="addToCart" :disabled="!product.stock">
                <el-icon><ShoppingCart /></el-icon> 加入购物车
              </el-button>
              <el-button type="danger" size="large" @click="buyNow" :disabled="!product.stock">
                立即购买
              </el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-else-if="!loading" description="商品不存在" />
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { getProductDetail, addToCart } from '@/api/shop'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const currentImage = ref('')
const quantity = ref(1)

const product = ref({})

const loadProduct = async () => {
  loading.value = true
  try {
    const res = await getProductDetail(route.params.id)
    product.value = res.data
    
    if (product.value.images && product.value.images.length > 0) {
      currentImage.value = product.value.images[0]
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    product.value = {}
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!product.value.stock) {
    ElMessage.warning('商品库存不足')
    return
  }
  
  try {
    await addToCart({
      productId: product.value.id,
      quantity: quantity.value,
      userId: userStore.userInfo.id
    })
    userStore.setCartCount(userStore.cartCount + 1)
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.info('加入购物车失败')
  }
}

const buyNow = () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!product.value.stock) {
    ElMessage.warning('商品库存不足')
    return
  }
  
  const items = [{
    ...product.value,
    quantity: quantity.value
  }]
  
  router.push({
    path: '/order/confirm',
    query: {
      items: encodeURIComponent(JSON.stringify(items))
    }
  })
}

onMounted(() => {
  loadProduct()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadProduct()
  }
})
</script>

<style scoped lang="scss">
.product-detail {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-card {
  :deep(.el-card__body) {
    padding: 30px;
  }
}

.detail-content {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.image-section {
  flex: 1;
  max-width: 500px;
  
  .main-image {
    margin-bottom: 15px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    
    img {
      width: 100%;
      display: block;
      object-fit: cover;
    }
  }
  
  .thumbnail-list {
    display: flex;
    gap: 12px;
    
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s;
      
      &.active {
        border-color: #C81D25;
      }
      
      &:hover {
        border-color: #C81D25;
      }
    }
  }
}

.info-section {
  flex: 1;
  
  .product-name {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
  }
  
  .product-desc {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .price-box {
    background: #fff5f5;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    
    .price-label {
      font-size: 14px;
      color: #999;
      margin-bottom: 8px;
    }
    
    .price-value {
      .current-price {
        font-size: 36px;
        color: #C81D25;
        font-weight: bold;
      }
    }
  }
  
  .info-row {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    
    .label {
      width: 80px;
      color: #999;
    }
    
    .value {
      flex: 1;
      color: #333;
    }
  }
  
  .quantity-section {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    .label {
      font-size: 14px;
      color: #999;
    }
  }
  
  .action-buttons {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    
    .el-button {
      flex: 1;
      height: 48px;
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
  }
  
  .image-section {
    max-width: 100%;
  }
}
</style>
