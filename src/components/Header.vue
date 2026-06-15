<template>
  <header class="header">
    <div class="container">
      <div class="logo" @click="$router.push('/')">
        <img src="/images/logo.png" alt="畲族文化" />
        <span>浙江畲族文化平台</span>
      </div>
      
      <nav class="nav-menu">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/culture">文化展示</el-menu-item>
          <el-menu-item index="/forum">交流论坛</el-menu-item>
          <el-menu-item index="/activity">文化活动</el-menu-item>
          <el-menu-item index="/shop">文创商城</el-menu-item>
          <el-menu-item index="/spot">文旅推荐</el-menu-item>
          <el-menu-item index="/ai">AI问答</el-menu-item>
          
          <el-menu-item v-if="isAdmin" index="/culture/publish">发布文化</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/activity/publish">发布活动</el-menu-item>
        </el-menu>
      </nav>
      
      <div class="user-actions">
        <template v-if="userStore.token">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <el-icon class="action-icon" @click="$router.push('/cart')">
              <ShoppingCart />
            </el-icon>
          </el-badge>
          
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo.avatar" />
              <span>{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="center">个人中心</el-dropdown-item>
                <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                <el-dropdown-item command="order">我的订单</el-dropdown-item>
                <el-dropdown-item command="friends">我的好友</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </header>
  
  <el-dialog v-model="showFriendsDialog" title="我的好友" width="600px" destroy-on-close>
    <el-tabs v-model="friendsTab">
      <el-tab-pane label="好友请求" name="requests">
        <div v-if="friendRequestsLoading" class="loading">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="friendRequests.length === 0" class="empty">
          <el-empty description="暂无好友请求" :image-size="60" />
        </div>
        <div v-else class="friends-list">
          <div class="friend-item" v-for="request in friendRequests" :key="request.id">
            <div class="friend-info">
              <el-avatar :src="request.fromAvatar" :size="40">
                {{ request.fromNickname?.[0] || request.fromUsername?.[0] || '?' }}
              </el-avatar>
              <div class="friend-detail">
                <span>{{ request.fromNickname || request.fromUsername }}</span>
                <small>{{ formatTime(request.createTime) }}</small>
              </div>
            </div>
            <div class="friend-actions">
              <el-button type="primary" size="small" @click="handleAcceptFriend(request)">接受</el-button>
              <el-button size="small" @click="handleRejectFriend(request)">拒绝</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="我发出的请求" name="sent">
        <div v-if="sentRequestsLoading" class="loading">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="sentRequests.length === 0" class="empty">
          <el-empty description="暂无发出的请求" :image-size="60" />
        </div>
        <div v-else class="friends-list">
          <div class="friend-item" v-for="request in sentRequests" :key="request.id">
            <div class="friend-info">
              <el-avatar :src="request.fromAvatar" :size="40">
                {{ request.fromNickname?.[0] || request.fromUsername?.[0] || '?' }}
              </el-avatar>
              <div class="friend-detail">
                <span>{{ request.fromNickname || request.fromUsername }}</span>
                <small>{{ formatTime(request.createTime) }}</small>
              </div>
            </div>
            <el-tag type="warning">等待对方同意</el-tag>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="我的好友" name="friends">
        <div v-if="friendsLoading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="friendList.length === 0" class="empty">
          <el-empty description="暂无好友" :image-size="60" />
        </div>
        <div v-else class="friends-list">
          <div class="friend-item" v-for="friend in friendList" :key="friend.id">
            <div class="friend-info">
              <el-avatar :src="friend.friendAvatar" :size="40">
                {{ friend.friendNickname?.[0] || friend.friendUsername?.[0] || '?' }}
              </el-avatar>
              <div class="friend-detail">
                <span>{{ friend.friendNickname || friend.friendUsername }}</span>
                <small>添加于 {{ formatTime(friend.createTime) }}</small>
              </div>
            </div>
            <div class="friend-actions">
              <el-button type="primary" size="small" @click="openChatDialog(friend)">私信</el-button>
              <el-button type="danger" size="small" @click="handleDeleteFriend(friend)">删除</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
  
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
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCart } from '@/api/shop'
import { getFriends, getFriendRequests, removeFriend } from '@/api/friend'
import { getMessages, sendMessage, markAsRead } from '@/api/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const cartCount = computed(() => userStore.cartCount)

const isAdmin = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.role === 'admin'
})

const loadCartCount = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (userInfo.id) {
    try {
      const res = await getCart(userInfo.id)
      userStore.setCartCount(res.data.length)
    } catch (error) {
      console.error('加载购物车数量失败:', error)
    }
  }
}

const showFriendsDialog = ref(false)
const friendsTab = ref('requests')
const friendList = ref([])
const friendsLoading = ref(false)
const friendRequests = ref([])
const friendRequestsLoading = ref(false)
const sentRequests = ref([])
const sentRequestsLoading = ref(false)

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const loadFriends = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) return
  friendsLoading.value = true
  try {
    const res = await getFriends(userInfo.id)
    friendList.value = res.data || []
  } catch (error) {
    console.error('加载好友列表失败:', error)
  } finally {
    friendsLoading.value = false
  }
}

const loadFriendRequests = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) return
  friendRequestsLoading.value = true
  try {
    const res = await getFriendRequests(userInfo.id)
    friendRequests.value = res.data || []
  } catch (error) {
    console.error('加载好友请求失败:', error)
  } finally {
    friendRequestsLoading.value = false
  }
}

const loadSentRequests = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) return
  sentRequestsLoading.value = true
  try {
    const res = await getFriendRequests(userInfo.id, 'sent')
    sentRequests.value = res.data || []
  } catch (error) {
    console.error('加载发出的请求失败:', error)
  } finally {
    sentRequestsLoading.value = false
  }
}

const openFriendsDialog = async () => {
  showFriendsDialog.value = true
  friendsTab.value = 'requests'
  await Promise.all([loadFriends(), loadFriendRequests(), loadSentRequests()])
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

onMounted(() => {
  loadCartCount()
})

const handleSelect = (key) => {
  router.push(key)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出成功')
    router.push('/')
  } else if (command === 'center') {
    router.push('/user')
  } else if (command === 'favorites') {
    router.push('/user/favorites')
  } else if (command === 'order') {
    router.push('/order')
  } else if (command === 'friends') {
    openFriendsDialog()
  }
}
</script>

<style scoped lang="scss">
.header {
  background: linear-gradient(135deg, #C81D25 0%, #8B1518 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    height: 70px;
    gap: 30px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    
    img {
      width: 60px;
      height: 40px;
    }
    
    span {
      color: white;
      font-size: 18px;
      font-weight: bold;
      white-space: nowrap;
    }
  }
  
  .nav-menu {
    flex: 1;
    
    :deep(.el-menu) {
      background: transparent;
      border-bottom: none;
      
      .el-menu-item {
        color: rgba(255, 255, 255, 0.9);
        font-size: 15px;
        
        &:hover,
        &.is-active {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
  
  .user-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .action-icon {
      font-size: 24px;
      color: white;
      cursor: pointer;
      
      &:hover {
        color: #F59E0B;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      cursor: pointer;
      
      span {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}

.friends-list {
  .friend-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .friend-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .friend-detail {
        display: flex;
        flex-direction: column;
        
        span {
          font-size: 14px;
          color: #333;
        }
        
        small {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .friend-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.empty {
  padding: 20px 0;
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
</style>
