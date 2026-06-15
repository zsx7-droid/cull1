<template>
  <div class="transaction-list">
    <Header />
    
    <div class="container">
      <h2 class="page-title">交易记录</h2>
      <p class="page-desc">您的支付订单记录</p>
      
      <div class="transactions" v-loading="loading">
        <el-card v-for="tx in transactions" :key="tx.id" class="transaction-card">
          <div class="tx-header">
            <div class="tx-info">
              <span class="order-no">{{ tx.orderNo }}</span>
              <span class="time">{{ formatTime(tx.payTime || tx.createTime) }}</span>
            </div>
            <div class="tx-status" :class="'status-' + tx.status">
              {{ tx.status === 'paid' ? '已支付' : '已完成' }}
            </div>
          </div>
          
          <div class="tx-body">
            <div class="tx-detail">
              <span class="label">支付方式：</span>
              <span class="value">{{ tx.paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</span>
            </div>
            <div class="tx-detail">
              <span class="label">商品数量：</span>
              <span class="value">{{ tx.itemCount }} 件</span>
            </div>
          </div>
          
          <div class="tx-footer">
            <span class="label">支付金额：</span>
            <span class="amount">¥{{ tx.amount }}</span>
            <el-button size="small" @click="viewOrder(tx.id)">查看订单</el-button>
          </div>
        </el-card>
        
        <el-empty v-if="transactions.length === 0 && !loading" description="暂无交易记录" />
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
import { getTransactions } from '@/api/transaction'

const router = useRouter()
const transactions = ref([])
const loading = ref(false)

const loadTransactions = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const res = await getTransactions(userInfo.id)
    transactions.value = res.data || []
  } catch (error) {
    console.error('加载交易记录失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const viewOrder = (id) => {
  router.push(`/order/${id}`)
}

onMounted(() => {
  loadTransactions()
})
</script>

<style scoped lang="scss">
.transaction-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
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

.transactions {
  .transaction-card {
    margin-bottom: 15px;
    
    .tx-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 15px;
      
      .tx-info {
        .order-no {
          font-weight: bold;
          margin-right: 15px;
        }
        
        .time {
          color: #999;
          font-size: 14px;
        }
      }
      
      .tx-status {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 14px;
        
        &.status-paid {
          background: #f0f9ff;
          color: #1E3A8A;
        }
        
        &.status-completed {
          background: #f0f9ff;
          color: #67C23A;
        }
      }
    }
    
    .tx-body {
      .tx-detail {
        display: flex;
        padding: 5px 0;
        
        .label {
          width: 80px;
          color: #999;
        }
        
        .value {
          display: flex;
          align-items: center;
          
          .payment-icon {
            width: 18px;
            height: 18px;
            margin-right: 5px;
          }
        }
      }
    }
    
    .tx-footer {
      display: flex;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #eee;
      margin-top: 15px;
      
      .label {
        color: #666;
      }
      
      .amount {
        flex: 1;
        font-size: 20px;
        color: #C81D25;
        font-weight: bold;
        margin-left: 10px;
      }
    }
  }
}
</style>
