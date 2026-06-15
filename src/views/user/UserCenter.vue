<template>
  <div class="user-center">
    <Header />
    
    <div class="container">
      <el-row :gutter="20">
        <!-- 左侧菜单 -->
        <el-col :xs="24" :sm="6">
          <el-card>
            <div class="user-profile">
              <el-avatar :size="80" :src="userInfo.avatar" />
              <h3>{{ userInfo.nickname || userInfo.username }}</h3>
              <p>{{ getUserRoleText(userInfo.role) }}</p>
            </div>
            
            <el-menu :default-active="activeMenu" @select="handleMenuSelect">
              <el-menu-item index="profile">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="orders">
                <el-icon><Document /></el-icon>
                <span>我的订单</span>
              </el-menu-item>
              <el-menu-item index="favorites">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
              <el-menu-item index="activities">
                <el-icon><Calendar /></el-icon>
                <span>我的活动</span>
              </el-menu-item>
              <el-menu-item index="friends">
                <el-icon><UserFilled /></el-icon>
                <span>我的好友</span>
              </el-menu-item>
              <el-menu-item v-if="userInfo.role === 'inheritor' || userInfo.role === 'merchant'" index="products">
                <el-icon><Goods /></el-icon>
                <span>我的商品</span>
              </el-menu-item>
              <el-menu-item index="sellerOrders">
                <el-icon><ShoppingCart /></el-icon>
                <span>卖家订单</span>
              </el-menu-item>
              <el-menu-item index="transactions">
                <el-icon><Wallet /></el-icon>
                <span>交易记录</span>
              </el-menu-item>
              <el-menu-item v-if="userInfo.role !== 'admin'" index="feedback">
                <el-icon><ChatDotRound /></el-icon>
                <span>意见反馈</span>
              </el-menu-item>
              <el-menu-item v-if="userInfo.role === 'admin'" index="feedbackManage">
                <el-icon><Setting /></el-icon>
                <span>反馈管理</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        
        <!-- 右侧内容区 -->
        <el-col :xs="24" :sm="18">
          <el-card>
            <!-- 个人信息 -->
            <div v-if="activeMenu === 'profile'">
              <h3 class="section-title">个人信息</h3>
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                label-width="100px"
              >
                <el-form-item label="用户名">
                  <el-input v-model="profileForm.username" disabled />
                </el-form-item>
                
                <el-form-item label="昵称">
                  <el-input v-model="profileForm.nickname" />
                </el-form-item>
                
                <el-form-item label="手机号">
                  <el-input v-model="profileForm.phone" />
                </el-form-item>
                
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                
                <el-form-item label="头像">
                  <div class="avatar-section">
                    <el-upload
                      class="avatar-uploader"
                      action="/api/upload"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                    >
                      <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <div class="avatar-tips">点击上传头像</div>
                    <div class="preset-avatars">
                      <div class="preset-title">选择预设头像</div>
                      <div class="avatar-list">
                        <img 
                          v-for="(avatar, index) in presetAvatars" 
                          :key="index"
                          :src="avatar" 
                          :class="['preset-avatar', { active: profileForm.avatar === avatar }]"
                          @click="selectPresetAvatar(avatar)"
                        />
                      </div>
                    </div>
                  </div>
                </el-form-item>
                
                <el-form-item label="个人简介">
                  <el-input
                    v-model="profileForm.bio"
                    type="textarea"
                    :rows="4"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="updateProfile">保存修改</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 我的收藏 -->
            <div v-else-if="activeMenu === 'favorites'">
              <h3 class="section-title">我的收藏</h3>
              
              <div v-if="favoritesLoading" class="loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="favorites.length === 0" class="empty">
                <el-empty description="暂无收藏内容" />
              </div>
              
              <div v-else class="post-list">
                <div class="post-item" v-for="post in favorites" :key="post.id">
                  <div class="post-info" @click="goToDetail(post.id)">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-meta">
                      <el-avatar :src="post.authorAvatar" :size="24" />
                      <span class="author-name">{{ post.authorName }}</span>
                      <span class="divider">·</span>
                      <span>{{ post.category }}</span>
                      <span class="divider">·</span>
                      <span>{{ post.likeCount || 0 }} 点赞</span>
                      <span class="divider">·</span>
                      <span>收藏于 {{ formatTime(post.favoritedAt) }}</span>
                    </div>
                  </div>
                  <el-button type="danger" size="small" @click.stop="cancelFavorite(post.id)">
                    取消收藏
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 我的订单 -->
            <div v-else-if="activeMenu === 'orders'">
              <h3 class="section-title">我的订单</h3>
              
              <div v-if="ordersLoading" class="loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="orderList.length === 0" class="empty">
                <el-empty description="暂无订单" />
              </div>
              
              <div v-else class="order-list">
                <div class="order-card" v-for="order in orderList" :key="order.id">
                  <div class="order-header">
                    <div class="order-info">
                      <span class="label">订单号：</span>
                      <span>{{ order.orderNo }}</span>
                    </div>
                    <div class="order-time">{{ formatOrderTime(order.createTime) }}</div>
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
                </div>
              </div>
            </div>
            
            <!-- 我的活动 -->
            <div v-else-if="activeMenu === 'activities'">
              <h3 class="section-title">我的活动</h3>
              
              <div v-if="myActivitiesLoading" class="loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="myActivities.length === 0" class="empty">
                <el-empty description="暂无报名活动" />
              </div>
              
              <div v-else class="activity-list">
                <div class="activity-card" v-for="activity in myActivities" :key="activity.id">
                  <div class="activity-info" @click="goToActivityDetail(activity.activityId)">
                    <h4>{{ activity.activityTitle }}</h4>
                    <p><strong>报名时间：</strong>{{ formatTime(activity.createTime) }}</p>
                    <p><strong>联系电话：</strong>{{ activity.phone }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 我的好友 -->
            <div v-else-if="activeMenu === 'friends'">
              <h3 class="section-title">好友请求</h3>
              
              <div v-if="requestsLoading" class="loading">
                <el-skeleton :rows="3" animated />
              </div>
              
              <div v-else-if="friendRequests.length > 0" class="friend-request-list">
                <div class="friend-request-card" v-for="request in friendRequests" :key="request.id">
                  <div class="friend-info">
                    <el-avatar :src="request.fromAvatar" :size="50">
                      {{ request.fromNickname?.[0] || request.fromUsername?.[0] || '?' }}
                    </el-avatar>
                    <div class="friend-detail">
                      <h4>{{ request.fromNickname || request.fromUsername }}</h4>
                      <p>请求时间：{{ formatTime(request.createTime) }}</p>
                    </div>
                  </div>
                  <div class="request-actions">
                    <el-button type="primary" size="small" @click="handleAcceptFriend(request)">
                      接受
                    </el-button>
                    <el-button size="small" @click="handleRejectFriend(request)">
                      拒绝
                    </el-button>
                  </div>
                </div>
              </div>
              <div v-else class="empty">
                <p style="color: #999; margin-bottom: 20px;">暂无好友请求</p>
              </div>
              
              <h3 class="section-title" style="margin-top: 30px;">我发出的请求</h3>
              
              <div v-if="sentLoading" class="loading">
                <el-skeleton :rows="3" animated />
              </div>
              
              <div v-else-if="sentRequests.length > 0" class="sent-request-list">
                <div class="sent-request-card" v-for="request in sentRequests" :key="request.id">
                  <div class="friend-info">
                    <el-avatar :src="request.fromAvatar" :size="50">
                      {{ request.fromNickname?.[0] || request.fromUsername?.[0] || '?' }}
                    </el-avatar>
                    <div class="friend-detail">
                      <h4>{{ request.fromNickname || request.fromUsername }}</h4>
                      <p>发送时间：{{ formatTime(request.createTime) }}</p>
                    </div>
                  </div>
                  <el-tag type="warning">等待对方同意</el-tag>
                </div>
              </div>
              <div v-else class="empty">
                <p style="color: #999; margin-bottom: 20px;">暂无发出的请求</p>
              </div>
              
              <h3 class="section-title" style="margin-top: 30px;">我的好友</h3>
              
              <div v-if="friendsLoading" class="loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="friendList.length === 0" class="empty">
                <el-empty description="暂无好友，快去交流论坛添加好友吧" />
              </div>
              
              <div v-else class="friend-list">
                <div class="friend-card" v-for="friend in friendList" :key="friend.id">
                  <div class="friend-info">
                    <el-avatar :src="friend.friendAvatar" :size="50">
                      {{ friend.friendNickname?.[0] || friend.friendUsername?.[0] || '?' }}
                    </el-avatar>
                    <div class="friend-detail">
                      <h4>{{ friend.friendNickname || friend.friendUsername }}</h4>
                      <p>添加时间：{{ formatTime(friend.createTime) }}</p>
                    </div>
                  </div>
                  <div class="friend-actions">
                    <el-button type="primary" size="small" @click="openChatDialog(friend)">
                      私信
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDeleteFriend(friend)">
                      删除好友
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 意见反馈 -->
            <div v-else-if="activeMenu === 'feedback'">
              <h3 class="section-title">意见反馈</h3>
              
              <el-form :model="feedbackForm" label-width="100px" class="feedback-form">
                <el-form-item label="反馈类型">
                  <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
                    <el-option label="用户意见" value="opinion" />
                    <el-option label="平台建议" value="suggestion" />
                    <el-option label="问题投诉" value="complaint" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="反馈内容">
                  <el-input 
                    v-model="feedbackForm.content" 
                    type="textarea" 
                    :rows="5" 
                    placeholder="请详细描述您的意见或建议..."
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handleSubmitFeedback" :loading="feedbackLoading">提交反馈</el-button>
                </el-form-item>
              </el-form>
              
              <el-divider />
              
              <h4 class="subsection-title">我的反馈记录</h4>
              
              <div v-if="myFeedbacksLoading" class="loading">
                <el-skeleton :rows="3" animated />
              </div>
              
              <div v-else-if="myFeedbacks.length === 0" class="empty">
                <el-empty description="暂无反馈记录" :image-size="60" />
              </div>
              
              <div v-else class="feedback-list">
                <el-card v-for="feedback in myFeedbacks" :key="feedback.id" class="feedback-card">
                  <div class="feedback-header">
                    <el-tag :type="getFeedbackTypeTag(feedback.type)">
                      {{ getFeedbackTypeText(feedback.type) }}
                    </el-tag>
                    <span class="feedback-time">{{ formatTime(feedback.createTime) }}</span>
                  </div>
                  <div class="feedback-content">{{ feedback.content }}</div>
                  <div class="feedback-status">
                    <el-tag :type="feedback.status === 'pending' ? 'warning' : 'success'" size="small">
                      {{ feedback.status === 'pending' ? '待处理' : '已处理' }}
                    </el-tag>
                  </div>
                </el-card>
              </div>
            </div>
            
            <!-- 其他菜单内容占位 -->
            <div v-else>
              <el-empty description="功能开发中" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 私信对话框 -->
    <el-dialog v-model="showChatDialog" :title="`与 ${chatFriend?.friendNickname || chatFriend?.friendUsername} 的聊天`" width="500px" destroy-on-close>
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div 
            v-for="msg in chatMessages" 
            :key="msg.id" 
            class="chat-message"
            :class="{ 'is-self': msg.senderId == currentUserId }"
          >
            <el-avatar :size="32" :src="msg.senderId == currentUserId ? currentUserAvatar : chatFriend?.friendAvatar">
              {{ msg.senderId == currentUserId ? '我' : '友' }}
            </el-avatar>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>
          <div v-if="chatMessages.length === 0" class="empty-chat">
            <p>暂无消息，开始聊天吧</p>
          </div>
        </div>
        <div class="chat-input">
          <el-input 
            v-model="chatInput" 
            placeholder="输入消息内容..." 
            @keyup.enter="sendChatMessage"
          />
          <el-button type="primary" @click="sendChatMessage">发送</el-button>
        </div>
      </div>
    </el-dialog>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateUserInfo } from '@/api/user'
import { getFavorites } from '@/api/user'
import { toggleFavorite } from '@/api/forum'
import { getOrders } from '@/api/shop'
import { getMyActivities } from '@/api/activity'
import { getFriends, getFriendRequests, removeFriend } from '@/api/friend'
import { getMessages, sendMessage, markAsRead } from '@/api/message'
import { submitFeedback, getFeedbacks } from '@/api/feedback'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeMenu = ref('profile')

const favorites = ref([])
const favoritesLoading = ref(false)
const orderList = ref([])
const ordersLoading = ref(false)
const myActivities = ref([])
const myActivitiesLoading = ref(false)
const friendList = ref([])
const friendsLoading = ref(false)
const friendRequests = ref([])
const requestsLoading = ref(false)
const sentRequests = ref([])
const sentLoading = ref(false)

const userInfo = ref(userStore.userInfo)

onMounted(() => {
  const tab = route.query.tab
  if (tab === 'friends') {
    activeMenu.value = 'friends'
    loadFriends()
    loadFriendRequests()
    loadSentRequests()
  }
})

const profileForm = reactive({
  username: userInfo.value.username || '',
  nickname: userInfo.value.nickname || '',
  phone: userInfo.value.phone || '',
  email: userInfo.value.email || '',
  avatar: userInfo.value.avatar || '',
  bio: userInfo.value.bio || ''
})

const getUserRoleText = (role) => {
  const map = {
    'user': '普通用户',
    'inheritor': '畲族传承人',
    'merchant': '商家',
    'admin': '管理员'
  }
  return map[role] || '用户'
}

const handleMenuSelect = (key) => {
  activeMenu.value = key
  if (key === 'favorites') {
    loadFavorites()
  } else if (key === 'orders') {
    loadOrders()
  } else if (key === 'activities') {
    loadMyActivities()
  } else if (key === 'friends') {
    loadFriends()
    loadFriendRequests()
    loadSentRequests()
  } else if (key === 'sellerOrders') {
    router.push('/seller-orders')
  } else if (key === 'transactions') {
    router.push('/transactions')
  } else if (key === 'feedback') {
    loadMyFeedbacks()
  } else if (key === 'feedbackManage') {
    router.push('/admin/feedback')
  }
}

const updateProfile = async () => {
  try {
    const res = await updateUserInfo({
      id: userStore.userInfo.id,
      nickname: profileForm.nickname,
      phone: profileForm.phone,
      email: profileForm.email,
      avatar: profileForm.avatar,
      bio: profileForm.bio
    })
    
    const updatedUserInfo = {
      ...userStore.userInfo,
      ...res.data
    }
    userStore.setUserInfo(updatedUserInfo)
    userInfo.value = updatedUserInfo
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleAvatarSuccess = (response) => {
  profileForm.avatar = response.url || response.data?.url || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
}

const presetAvatars = ref([
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8'
])

const selectPresetAvatar = (avatar) => {
  profileForm.avatar = avatar
}

const loadFavorites = async () => {
  favoritesLoading.value = true
  try {
    const res = await getFavorites(userStore.userInfo.id)
    favorites.value = res.data
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    favoritesLoading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/forum/${id}`)
}

const cancelFavorite = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await toggleFavorite({
      targetId: postId,
      targetType: 'post',
      userId: userStore.userInfo.id
    })
    
    favorites.value = favorites.value.filter(f => f.id !== postId)
    ElMessage.success('已取消收藏')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
    }
  }
}

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await getOrders(userStore.userInfo.id)
    orderList.value = res.data
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    ordersLoading.value = false
  }
}

const loadMyActivities = async () => {
  myActivitiesLoading.value = true
  try {
    const res = await getMyActivities(userStore.userInfo.id)
    myActivities.value = res.data || []
  } catch (error) {
    console.error('加载我的活动失败:', error)
  } finally {
    myActivitiesLoading.value = false
  }
}

const loadFriends = async () => {
  friendsLoading.value = true
  try {
    const res = await getFriends(userStore.userInfo.id)
    friendList.value = res.data || []
  } catch (error) {
    console.error('加载好友列表失败:', error)
  } finally {
    friendsLoading.value = false
  }
}

const loadFriendRequests = async () => {
  requestsLoading.value = true
  try {
    const res = await getFriendRequests(userStore.userInfo.id)
    friendRequests.value = res.data || []
  } catch (error) {
    console.error('加载好友请求失败:', error)
  } finally {
    requestsLoading.value = false
  }
}

const loadSentRequests = async () => {
  sentLoading.value = true
  try {
    const res = await getFriendRequests(userStore.userInfo.id, 'sent')
    sentRequests.value = res.data || []
  } catch (error) {
    console.error('加载发出的请求失败:', error)
  } finally {
    sentLoading.value = false
  }
}

const handleAcceptFriend = async (request) => {
  try {
    await removeFriend(request.id, 'accept')
    ElMessage.success('已接受好友请求')
    loadFriendRequests()
    loadFriends()
  } catch (error) {
    console.error('接受好友请求失败:', error)
  }
}

const handleRejectFriend = async (request) => {
  try {
    await removeFriend(request.id, 'reject')
    ElMessage.success('已拒绝好友请求')
    loadFriendRequests()
  } catch (error) {
    console.error('拒绝好友请求失败:', error)
  }
}

const handleDeleteFriend = async (friend) => {
  try {
    await ElMessageBox.confirm(`确定要删除好友 ${friend.friendNickname || friend.friendUsername} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeFriend(friend.id)
    ElMessage.success('删除成功')
    loadFriends()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除好友失败:', error)
    }
  }
}

const showChatDialog = ref(false)
const chatFriend = ref(null)
const chatMessages = ref([])
const chatInput = ref('')
const chatMessagesRef = ref(null)
const currentUserId = ref(null)
const currentUserAvatar = ref('')

const feedbackForm = reactive({
  type: '',
  content: ''
})
const feedbackLoading = ref(false)
const myFeedbacks = ref([])
const myFeedbacksLoading = ref(false)

const handleSubmitFeedback = async () => {
  if (!feedbackForm.type) {
    ElMessage.warning('请选择反馈类型')
    return
  }
  if (!feedbackForm.content.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  
  feedbackLoading.value = true
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    await submitFeedback({
      userId: userInfo.id,
      type: feedbackForm.type,
      content: feedbackForm.content.trim()
    })
    ElMessage.success('反馈提交成功')
    feedbackForm.type = ''
    feedbackForm.content = ''
    loadMyFeedbacks()
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交失败')
  } finally {
    feedbackLoading.value = false
  }
}

const loadMyFeedbacks = async () => {
  myFeedbacksLoading.value = true
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const res = await getFeedbacks(userInfo.id)
    myFeedbacks.value = res.data || []
  } catch (error) {
    console.error('加载反馈记录失败:', error)
  } finally {
    myFeedbacksLoading.value = false
  }
}

const getFeedbackTypeText = (type) => {
  const map = {
    'opinion': '用户意见',
    'suggestion': '平台建议',
    'complaint': '问题投诉'
  }
  return map[type] || type
}

const getFeedbackTypeTag = (type) => {
  const map = {
    'opinion': '',
    'suggestion': 'success',
    'complaint': 'danger'
  }
  return map[type] || ''
}

const openChatDialog = async (friend) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  currentUserId.value = userInfo.id
  currentUserAvatar.value = userInfo.avatar
  chatFriend.value = friend
  showChatDialog.value = true
  await loadChatMessages(friend.friendId)
}

const loadChatMessages = async (friendId) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  try {
    const res = await getMessages(userInfo.id, friendId)
    chatMessages.value = res.data || []
    await markAsRead(userInfo.id, friendId)
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  } catch (error) {
    console.error('加载聊天记录失败:', error)
  }
}

const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  try {
    await sendMessage({
      senderId: userInfo.id,
      receiverId: chatFriend.value.friendId,
      content: chatInput.value.trim()
    })
    chatInput.value = ''
    await loadChatMessages(chatFriend.value.friendId)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败')
  }
}

const goToActivityDetail = (id) => {
  router.push(`/activity/${id}`)
}

const getTotalQuantity = (items) => {
  if (!items) return 0
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

const formatOrderTime = (time) => {
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

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  
  if (days < 1) return '今天'
  if (days < 7) return days + '天前'
  if (days < 30) return Math.floor(days / 7) + '周前'
  if (days < 365) return Math.floor(days / 30) + '月前'
  return Math.floor(days / 365) + '年前'
}
</script>

<style scoped lang="scss">
.user-center {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-profile {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    color: #333;
    margin: 15px 0 5px;
  }
  
  p {
    font-size: 14px;
    color: #999;
  }
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #C81D25;
}

.avatar-uploader {
  display: inline-block;
  
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      border-color: #C81D25;
    }
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    object-fit: cover;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
    line-height: 120px;
  }
}

.avatar-section {
  .avatar-tips {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }
  
  .preset-avatars {
    margin-top: 20px;
    
    .preset-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .avatar-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .preset-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.1);
        }
        
        &.active {
          border-color: #C81D25;
        }
      }
    }
  }
}

.loading, .empty {
  padding: 40px 0;
}

.post-list {
  .post-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .post-info {
      flex: 1;
      cursor: pointer;
      
      &:hover .post-title {
        color: #C81D25;
      }
      
      .post-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        transition: color 0.3s;
      }
      
      .post-meta {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #999;
        
        .author-name {
          margin-left: 8px;
          margin-right: 8px;
        }
        
        .divider {
          margin: 0 8px;
        }
      }
    }
  }
}

.order-list {
  .order-card {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    
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
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .product-info {
          flex: 1;
          
          h4 {
            font-size: 14px;
            color: #333;
          }
        }
        
        .product-price {
          width: 80px;
          text-align: center;
          color: #666;
        }
        
        .product-quantity {
          width: 50px;
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
          font-size: 16px;
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
    }
  }
}

.activity-list {
  .activity-card {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    
    .activity-info {
      cursor: pointer;
      
      &:hover h4 {
        color: #C81D25;
      }
      
      h4 {
        font-size: 16px;
        color: #333;
        margin-bottom: 10px;
        transition: color 0.3s;
      }
      
      p {
        font-size: 14px;
        color: #666;
        margin: 5px 0;
        
        strong {
          color: #1E3A8A;
        }
      }
    }
  }
}

.friend-list {
  .friend-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
    
    .friend-info {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .friend-detail {
        h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }
        
        p {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
}

.friend-request-list {
  .friend-request-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #67C23A;
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: #f6ffed;
    
    .friend-info {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .friend-detail {
        h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }
        
        p {
          font-size: 14px;
          color: #999;
        }
      }
    }
    
    .request-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.sent-request-list {
  .sent-request-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #E6A23C;
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: #fdf6ec;
    
    .friend-info {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .friend-detail {
        h4 {
          font-size: 16px;
          color: #333;
          margin-bottom: 5px;
        }
        
        p {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
}

.friend-actions {
  display: flex;
  gap: 8px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 15px;
    
    .chat-message {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: flex-start;
      
      &.is-self {
        flex-direction: row-reverse;
        
        .message-content {
          align-items: flex-end;
          
          .message-text {
            background: #1E3A8A;
            color: white;
          }
        }
      }
      
      .message-content {
        display: flex;
        flex-direction: column;
        max-width: 70%;
        
        .message-text {
          padding: 10px 14px;
          background: white;
          border-radius: 8px;
          word-break: break-word;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
    
    .empty-chat {
      text-align: center;
      color: #999;
      padding: 40px 0;
    }
  }
  
  .chat-input {
    display: flex;
    gap: 10px;
    
    .el-input {
      flex: 1;
    }
  }
}

.feedback-form {
  max-width: 600px;
}

.subsection-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.feedback-list {
  .feedback-card {
    margin-bottom: 15px;
    
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .feedback-time {
        font-size: 12px;
        color: #999;
      }
    }
    
    .feedback-content {
      color: #333;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    
    .feedback-status {
      text-align: right;
    }
  }
}
</style>
