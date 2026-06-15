<template>
  <div class="order-detail">
    <Header />
    
    <div class="container">
      <el-card class="detail-card" v-loading="loading">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/order' }">我的订单</el-breadcrumb-item>
          <el-breadcrumb-item>订单详情</el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 订单状态 -->
        <div class="order-status-section">
          <el-steps :active="getStepActive(order.status)" finish-status="success">
            <el-step title="提交订单" :description="formatTime(order.createTime)" />
            <el-step title="买家付款" />
            <el-step title="卖家发货" />
            <el-step title="确认收货" />
          </el-steps>
          
          <div class="current-status">
            <el-alert
              :title="getStatusText(order.status)"
              :type="getStatusType(order.status)"
              :closable="false"
              show-icon
            />
          </div>
        </div>
        
        <!-- 订单信息 -->
        <div class="order-info-section">
          <h3>订单信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatTime(order.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="收货人">-</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ order.contact || '-' }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ order.address || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 商品信息 -->
        <div class="products-section">
          <h3>商品信息</h3>
          <div class="product-list">
            <div class="product-item" v-for="item in order.items" :key="item.productId">
              <img :src="item.productImage || ''" alt="" />
              <div class="product-info">
                <h4>{{ item.productName }}</h4>
              </div>
              <div class="product-price">¥{{ item.price }}</div>
              <div class="product-quantity">x{{ item.quantity }}</div>
              <div class="product-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 订单金额 -->
        <div class="amount-section">
          <div class="amount-row total">
            <span>实付金额：</span>
            <span class="total-amount">¥{{ order.totalAmount }}</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button @click="$router.push('/order')">返回订单列表</el-button>
          <el-button v-if="order.status === 'pending'" type="primary" @click="handlePay" :loading="paying">
            立即付款
          </el-button>
        </div>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, payOrder } from '@/api/shop'

const route = useRoute()

const loading = ref(false)
const paying = ref(false)
const order = ref({
  id: '',
  orderNo: '',
  createTime: '',
  status: '',
  contact: '',
  address: '',
  items: [],
  totalAmount: 0
})

const loadOrderDetail = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    return
  }
  
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id, userInfo.id)
    order.value = res.data
  } catch (error) {
    console.error('加载订单详情失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getStepActive = (status) => {
  const map = {
    'pending': 1,
    'paid': 2,
    'shipped': 3,
    'completed': 4
  }
  return map[status] || 0
}

const getStatusText = (status) => {
  const map = {
    'pending': '等待买家付款',
    'paid': '买家已付款，等待卖家发货',
    'shipped': '卖家已发货，等待确认收货',
    'completed': '交易成功',
    'cancelled': '订单已取消'
  }
  return map[status] || '未知状态'
}

const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'paid': 'info',
    'shipped': 'success',
    'completed': 'success',
    'cancelled': 'error'
  }
  return map[status] || 'info'
}

const handlePay = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要支付订单 ¥${order.value.totalAmount} 吗？`, '付款确认', {
      confirmButtonText: '确定付款',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    paying.value = true
    await payOrder(order.value.id, userInfo.id)
    
    ElMessage.success('付款成功')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('付款失败:', error)
      ElMessage.error(error.response?.data?.message || '付款失败')
    }
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.detail-card {
  :deep(.el-card__body) {
    padding: 30px;
  }
}

.order-status-section {
  margin-bottom: 30px;
  
  .current-status {
    margin-top: 20px;
  }
}

.order-info-section,
.products-section,
.shipping-section {
  margin-top: 30px;
  
  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #C81D25;
  }
}

.product-list {
  .product-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 1px solid #eee;
    margin-bottom: 10px;
    border-radius: 4px;
    
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
    
    .product-total {
      width: 120px;
      text-align: center;
      color: #C81D25;
      font-weight: bold;
      font-size: 16px;
    }
  }
}

.amount-section {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  
  .amount-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    
    &.total {
      .total-amount {
        font-size: 24px;
        color: #C81D25;
        font-weight: bold;
      }
    }
  }
}

.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>
