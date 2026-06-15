<template>
  <div class="order-list">
    <Header />
    
    <div class="container">
      <h2 class="page-title">卖家订单</h2>
      
      <div class="order-items" v-loading="loading">
        <el-card v-for="order in orderList" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="label">订单号：</span>
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="order-time">{{ formatTime(order.createTime) }}</div>
          </div>
          
          <div class="buyer-info">
            <el-icon><User /></el-icon>
            <span class="label">买家：</span>
            <span>{{ order.buyerNickname || order.buyerName }}</span>
            <span class="divider">|</span>
            <el-icon><Phone /></el-icon>
            <span class="label">电话：</span>
            <span>{{ order.buyerPhone || '未填写' }}</span>
          </div>
          
          <div class="order-products">
            <div class="product-item" v-for="item in order.items" :key="item.productId">
              <img :src="item.productImage || ''" alt="" />
              <div class="product-info">
                <h4>{{ item.productName }}</h4>
              </div>
              <div class="product-price">¥{{ item.price }}</div>
              <div class="product-quantity">x{{ item.quantity }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              <span>共 {{ getTotalQuantity(order.items) }} 件商品</span>
              <span class="total-amount">收益：¥{{ getSellerTotal(order.items) }}</span>
            </div>
            
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
            
            <div class="order-actions">
              <el-button size="small" @click="viewDetail(order.id)">查看详情</el-button>
            </div>
          </div>
        </el-card>
        
        <el-empty v-if="orderList.length === 0 && !loading" description="暂无卖家订单" />
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
import { getSellerOrders } from '@/api/shop'
import { User, Phone } from '@element-plus/icons-vue'

const router = useRouter()
const orderList = ref([])
const loading = ref(false)

const loadOrders = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const res = await getSellerOrders(userInfo.id)
    orderList.value = res.data || []
  } catch (error) {
    console.error('加载订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

const getSellerTotal = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const getStatusClass = (status) => {
  const map = {
    'pending': 'status-pending',
    'paid': 'status-paid',
    'shipped': 'status-shipped',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

const viewDetail = (id) => {
  router.push(`/order/${id}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.order-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1000px;
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

.order-items {
  .order-card {
    margin-bottom: 20px;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 15px;
      
      .order-info {
        .label {
          color: #999;
        }
      }
      
      .order-time {
        color: #999;
        font-size: 14px;
      }
    }
    
    .buyer-info {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 10px 15px;
      background: #f0f9ff;
      border-radius: 8px;
      margin-bottom: 15px;
      color: #333;
      
      .el-icon {
        color: #1E3A8A;
      }
      
      .label {
        color: #666;
      }
      
      .divider {
        margin: 0 10px;
        color: #ddd;
      }
    }
    
    .order-products {
      .product-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .product-info {
          flex: 1;
          
          h4 {
            font-size: 16px;
            margin-bottom: 5px;
          }
        }
        
        .product-price {
          color: #C81D25;
          font-size: 16px;
          font-weight: bold;
        }
        
        .product-quantity {
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #eee;
      margin-top: 15px;
      
      .order-total {
        .total-amount {
          color: #C81D25;
          font-size: 18px;
          font-weight: bold;
          margin-left: 15px;
        }
      }
      
      .order-status {
        padding: 5px 15px;
        border-radius: 4px;
        font-size: 14px;
        
        &.status-pending {
          background: #fef0f0;
          color: #C81D25;
        }
        
        &.status-paid {
          background: #f0f9ff;
          color: #1E3A8A;
        }
        
        &.status-shipped {
          background: #f0f9ff;
          color: #E6A23C;
        }
        
        &.status-completed {
          background: #f0f9ff;
          color: #67C23A;
        }
        
        &.status-cancelled {
          background: #f5f7fa;
          color: #909399;
        }
      }
    }
  }
}
</style>
