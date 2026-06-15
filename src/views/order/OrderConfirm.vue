<template>
  <div class="order-confirm">
    <Header />
    
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">确认订单</span>
          </div>
        </template>
        
        <div class="order-items">
          <div class="item" v-for="item in orderItems" :key="item.id">
            <img :src="item.images?.[0] || ''" alt="" />
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>分类: {{ item.category }}</p>
            </div>
            <div class="item-price">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <el-form :model="orderForm" label-width="100px">
          <el-form-item label="收货地址">
            <el-input v-model="orderForm.address" placeholder="请输入收货地址" />
          </el-form-item>
          
          <el-form-item label="联系电话">
            <el-input v-model="orderForm.contact" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="订单备注">
            <el-input v-model="orderForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </el-form-item>
          
          <el-form-item label="支付方式">
            <el-radio-group v-model="orderForm.paymentMethod">
              <el-radio value="wechat">微信支付</el-radio>
              <el-radio value="alipay">支付宝</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        
        <el-divider />
        
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总价:</span>
            <span>¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额:</span>
            <span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="submit-section">
          <el-button type="primary" size="large" @click="submitOrder" :loading="loading">
            提交订单
          </el-button>
        </div>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { createOrder, clearCart } from '@/api/shop'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const orderItems = ref([])

const orderForm = reactive({
  address: '',
  contact: '',
  remark: '',
  paymentMethod: 'wechat'
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const loadOrderItems = () => {
  const items = route.query.items
  if (items) {
    try {
      orderItems.value = JSON.parse(decodeURIComponent(items))
    } catch (error) {
      console.error('解析订单商品失败:', error)
      ElMessage.error('订单信息错误')
      router.push('/shop')
    }
  } else {
    ElMessage.error('订单信息错误')
    router.push('/shop')
  }
}

const submitOrder = async () => {
  if (!orderForm.contact) {
    ElMessage.warning('请输入联系电话')
    return
  }
  
  if (!orderForm.address) {
    ElMessage.warning('请输入收货地址')
    return
  }
  
  loading.value = true
  try {
    const orderData = {
      items: orderItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        images: item.images
      })),
      userId: JSON.parse(localStorage.getItem('userInfo') || '{}').id,
      address: orderForm.address,
      contact: orderForm.contact,
      totalAmount: totalAmount.value,
      paymentMethod: orderForm.paymentMethod
    }
    
    console.log('提交订单数据:', orderData)
    
    const res = await createOrder(orderData)
    
    ElMessage.success('订单提交成功')
    
    router.push(`/order/pay/${res.data.id}`)
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error(error.response?.data?.message || '提交订单失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  loadOrderItems()
})
</script>

<style scoped lang="scss">
.order-confirm {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.order-items {
  .item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .item-info {
      flex: 1;
      margin-left: 15px;
      
      h4 {
        font-size: 16px;
        margin-bottom: 5px;
      }
      
      p {
        font-size: 13px;
        color: #999;
      }
    }
    
    .item-price {
      text-align: right;
      
      .price {
        display: block;
        font-size: 18px;
        color: #C81D25;
        font-weight: bold;
      }
      
      .quantity {
        display: block;
        font-size: 14px;
        color: #999;
      }
    }
  }
}

.order-summary {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    
    &.total {
      font-size: 18px;
      font-weight: bold;
      border-top: 1px solid #ddd;
      margin-top: 10px;
      padding-top: 15px;
      
      .amount {
        color: #C81D25;
        font-size: 24px;
      }
    }
  }
}

.submit-section {
  text-align: right;
  margin-top: 20px;
  
  .el-button {
    width: 200px;
  }
}
</style>
