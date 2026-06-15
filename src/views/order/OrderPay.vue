<template>
  <div class="order-pay">
    <Header />
    
    <div class="container">
      <el-card v-if="order">
        <template #header>
          <div class="card-header">
            <span class="title">订单支付</span>
          </div>
        </template>
        
        <div v-if="order.status === 'cancelled'" class="order-expired">
          <el-result
            icon="warning"
            title="订单已过期"
            sub-title="该订单已超时未支付，已自动取消"
          >
            <template #extra>
              <el-button type="primary" @click="router.push('/shop')">返回商城</el-button>
            </template>
          </el-result>
        </div>
        
        <div v-else-if="order.status === 'paid' || order.status === 'completed'" class="order-paid">
          <el-result
            icon="success"
            title="支付成功"
            sub-title="您的订单已支付成功"
          >
            <template #extra>
              <el-button type="primary" @click="router.push('/order')">查看订单</el-button>
            </template>
          </el-result>
        </div>
        
        <div v-else class="payment-content">
          <div class="order-info">
            <div class="info-row">
              <span class="label">订单号：</span>
              <span>{{ order.orderNo }}</span>
            </div>
            <div class="info-row">
              <span class="label">商品数量：</span>
              <span>{{ getTotalQuantity(order.items) }} 件</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span>{{ order.address }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span>{{ order.contact }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式：</span>
              <span>{{ order.paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</span>
            </div>
            <div class="info-row expire-time" v-if="order.expireTime">
              <span class="label">支付期限：</span>
              <span class="countdown">请在 {{ countdownText }} 内完成支付</span>
            </div>
          </div>
          
          <el-divider />
          
          <div class="payment-amount">
            <span class="label">支付金额：</span>
            <span class="amount">¥{{ order.totalAmount }}</span>
          </div>
          
          <div class="payment-qrcode">
            <div class="qrcode-box">
              <div class="qrcode-placeholder">
                <p>{{ order.paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</p>
                <p class="scan-hint">模拟支付 - 点击下方按钮完成支付</p>
              </div>
            </div>
          </div>
          
          <div class="payment-actions">
            <el-button type="primary" size="large" @click="handlePay" :loading="loading">
              确认支付 ¥{{ order.totalAmount }}
            </el-button>
            <el-button size="large" @click="router.push('/order')">取消</el-button>
          </div>
        </div>
      </el-card>
      
      <el-empty v-else description="订单不存在" />
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { getOrderDetail, payOrder } from '@/api/shop'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const countdownText = ref('')
let countdownTimer = null

const loadOrder = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    router.push('/login')
    return
  }
  
  try {
    const res = await getOrderDetail(route.params.id, userInfo.id)
    order.value = res.data
    
    if (order.value.expireTime && new Date(order.value.expireTime) < new Date() && order.value.status === 'pending') {
      order.value.status = 'cancelled'
    } else if (order.value.expireTime) {
      countdownText.value = formatCountdown(order.value.expireTime)
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.info('订单不存在')
  }
}

const formatCountdown = (expireTime) => {
  if (!expireTime) return ''
  const now = new Date()
  const expire = new Date(expireTime)
  const diff = expire - now
  
  if (diff <= 0) return '已过期'
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  return `${minutes}分${seconds}秒`
}

const handlePay = async () => {
  loading.value = true
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    await payOrder(order.value.id, userInfo.id)
    ElMessage.success('支付成功')
    order.value.status = 'paid'
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.info(error.response?.data?.message || '支付失败')
  } finally {
    loading.value = false
  }
}

const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

onMounted(() => {
  loadOrder()
  countdownTimer = setInterval(() => {
    if (order.value && order.value.expireTime && order.value.status === 'pending') {
      countdownText.value = formatCountdown(order.value.expireTime)
      if (new Date(order.value.expireTime) < new Date()) {
        order.value.status = 'cancelled'
        clearInterval(countdownTimer)
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped lang="scss">
.order-pay {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
}

.card-header {
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.order-info {
  .info-row {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      width: 100px;
      color: #999;
    }
    
    .payment-icon {
      width: 20px;
      height: 20px;
      vertical-align: middle;
      margin-right: 5px;
    }
    
    .countdown {
      color: #C81D25;
      font-weight: bold;
    }
  }
}

.payment-amount {
  text-align: center;
  padding: 20px 0;
  
  .label {
    font-size: 16px;
    color: #666;
  }
  
  .amount {
    font-size: 32px;
    color: #C81D25;
    font-weight: bold;
    margin-left: 10px;
  }
}

.payment-qrcode {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  
  .qrcode-box {
    text-align: center;
    
    .qrcode-placeholder {
      width: 200px;
      height: 200px;
      background: #f5f7fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      
      .payment-logo {
        width: 80px;
        height: 80px;
        margin-bottom: 10px;
      }
      
      p {
        margin: 5px 0;
        color: #333;
      }
      
      .scan-hint {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.payment-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  
  .el-button {
    width: 200px;
  }
}
</style>
