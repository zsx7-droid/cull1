<template>
  <div class="cart">
    <Header />
    
    <div class="container">
      <h2 class="page-title">我的购物车</h2>
      
      <el-card v-loading="loading">
        <div v-if="cartItems.length > 0" class="cart-list">
          <div class="cart-header">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
            <span class="col-product">商品信息</span>
            <span class="col-price">单价</span>
            <span class="col-quantity">数量</span>
            <span class="col-total">小计</span>
            <span class="col-action">操作</span>
          </div>
          
          <div class="cart-item" v-for="item in cartItems" :key="item.cartId">
            <el-checkbox v-model="item.selected" @change="handleSelectionChange" />
            
            <div class="product-info" @click="goToProduct(item.id)">
              <img :src="item.images?.[0] || ''" alt="" />
              <div class="info-text">
                <h4>{{ item.name }}</h4>
                <p>{{ item.category }}</p>
              </div>
            </div>
            
            <div class="price">¥{{ item.price }}</div>
            
            <div class="quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock > 0 ? item.stock : 1"
                size="small"
                @change="updateQuantity(item)"
              />
            </div>
            
            <div class="total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            
            <div class="action">
              <el-button type="text" @click="removeItem(item.cartId)">删除</el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-else description="购物车是空的,快去选购商品吧" />
      </el-card>
      
      <div v-if="cartItems.length > 0" class="checkout-bar">
        <div class="selected-info">
          已选择 <span class="count">{{ selectedCount }}</span> 件商品
        </div>
        <div class="total-info">
          合计：<span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <el-button type="primary" size="large" @click="checkout" :disabled="selectedCount === 0">
          去结算
        </el-button>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCart, removeFromCart } from '@/api/shop'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const cartItems = ref([])

const loadCart = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  console.log('localStorage userInfo:', userInfo)
  console.log('userInfo.id:', userInfo.id)
  
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    console.log('正在请求购物车数据, userId:', userInfo.id)
    const res = await getCart(userInfo.id)
    console.log('购物车数据:', res.data)
    cartItems.value = res.data.map(item => ({
      ...item,
      selected: true
    }))
  } catch (error) {
    console.error('加载购物车失败:', error)
  } finally {
    loading.value = false
  }
}

const selectAll = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.selected),
  set: (val) => {
    cartItems.value.forEach(item => item.selected = val)
  }
})

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const handleSelectAll = () => {
}

const handleSelectionChange = () => {
}

const updateQuantity = async (item) => {
  if (item.quantity > item.stock) {
    ElMessage.warning('库存不足')
    item.quantity = item.stock
  }
}

const removeItem = async (cartId) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeFromCart(cartId)
    cartItems.value = cartItems.value.filter(item => item.cartId !== cartId)
    userStore.setCartCount(userStore.cartCount - 1)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const checkout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  router.push({
    path: '/order/confirm',
    query: {
      items: encodeURIComponent(JSON.stringify(selectedItems))
    }
  })
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped lang="scss">
.cart {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.cart-list {
  .cart-header {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 2px solid #eee;
    font-weight: bold;
    color: #666;
    
    .col-product {
      flex: 2;
      margin-left: 10px;
    }
    
    .col-price {
      width: 100px;
      text-align: center;
    }
    
    .col-quantity {
      width: 120px;
      text-align: center;
    }
    
    .col-total {
      width: 100px;
      text-align: center;
      color: #C81D25;
    }
    
    .col-action {
      width: 80px;
      text-align: center;
    }
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .product-info {
      flex: 2;
      display: flex;
      gap: 15px;
      margin-left: 10px;
      cursor: pointer;
      
      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .info-text {
        h4 {
          font-size: 14px;
          color: #333;
          margin-bottom: 5px;
        }
        
        p {
          font-size: 13px;
          color: #999;
        }
      }
    }
    
    .price {
      width: 100px;
      text-align: center;
      color: #666;
    }
    
    .quantity {
      width: 120px;
      text-align: center;
    }
    
    .total {
      width: 100px;
      text-align: center;
      color: #C81D25;
      font-weight: bold;
    }
    
    .action {
      width: 80px;
      text-align: center;
    }
  }
}

.checkout-bar {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFF 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .selected-info {
    .count {
      color: #C81D25;
      font-weight: bold;
    }
  }
  
  .total-info {
    .amount {
      font-size: 24px;
      color: #C81D25;
      font-weight: bold;
    }
  }
}
</style>
