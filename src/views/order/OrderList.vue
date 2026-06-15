<template>
  <div class="order-list">
    <Header />
    
    <div class="container">
      <h2 class="page-title">我的订单</h2>
      
      <!-- 订单列表 -->
      <div class="order-items" v-loading="loading">
        <el-card v-for="order in orderList" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="label">订单号：</span>
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="order-time">{{ formatTime(order.createTime) }}</div>
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
              <span class="total-amount">实付：¥{{ order.totalAmount }}</span>
            </div>
            
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
            
            <div class="order-actions">
              <el-button size="small" @click="viewDetail(order.id)">查看详情</el-button>
            </div>
          </div>
        </el-card>
        
        <el-empty v-if="orderList.length === 0 && !loading" description="暂无订单" />
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
import { getOrders } from '@/api/shop'

const router = useRouter()

const loading = ref(false)
const orderList = ref([])

const loadOrders = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    return
  }
  
  loading.value = true
  try {
    const res = await getOrders(userInfo.id)
    orderList.value = res.data
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getStatusText = (status) => {
  const map = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || '未知状态'
}

const getStatusClass = (status) => {
  const map = {
    'pending': 'status-unpaid',
    'paid': 'status-paid',
    'shipped': 'status-shipped',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return map[status] || ''
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
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.order-items {
  .order-card {
    margin-bottom: 15px;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      
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
    
    .order-products {
      padding: 15px 0;
      
      .product-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;
        
        &:not(:last-child) {
          border-bottom: 1px solid #eee;
        }
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .product-info {
          flex: 1;
          
          h4 {
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
          }
        }
        
        .product-price {
          width: 100px;
          text-align: center;
          color: #666;
        }
        
        .product-quantity {
          width: 60px;
          text-align: center;
          color: #666;
        }
      }
    }
    
    .order-footer {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      
      .order-total {
        flex: 1;
        
        .total-amount {
          font-size: 18px;
          color: #C81D25;
          font-weight: bold;
          margin-left: 10px;
        }
      }
      
      .order-status {
        font-size: 14px;
        font-weight: bold;
        
        &.status-unpaid, &.status-pending {
          color: #E6A23C;
        }
        
        &.status-paid {
          color: #409EFF;
        }
        
        &.status-shipped {
          color: #67C23A;
        }
        
        &.status-completed {
          color: #67C23A;
        }
        
        &.status-cancelled {
          color: #909399;
        }
      }
      
      .order-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>
