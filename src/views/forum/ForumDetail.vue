<template>
  <div class="forum-detail">
    <Header />
    
    <div class="container">
      <el-card class="post-card">
        <!-- 帖子内容 -->
        <div class="post-content">
          <h1 class="post-title">{{ post.title }}</h1>
          
          <div class="post-meta">
            <el-avatar :src="post.authorAvatar" :size="40" />
            <div class="meta-info">
              <div class="author-name">{{ post.authorName }}</div>
              <div class="meta-details">
                <span>{{ post.createTime }}</span>
                <el-tag size="small">{{ post.category }}</el-tag>
                <span><el-icon><View /></el-icon> {{ post.views }}</span>
              </div>
            </div>
            <el-button 
              v-if="post.authorId && post.authorId !== userStore.userInfo?.id && friendRequestStatus === 'none'" 
              type="primary" 
              size="small" 
              @click="handleAddFriend"
              style="margin-left: auto;"
            >
              添加好友
            </el-button>
            <el-button 
              v-else-if="post.authorId && post.authorId !== userStore.userInfo?.id && friendRequestStatus === 'pending'" 
              type="info" 
              size="small" 
              disabled
              style="margin-left: auto;"
            >
              已发送请求
            </el-button>
          </div>
          
          <div class="post-body">{{ post.content }}</div>
          
          <div class="post-images" v-if="post.images && post.images.length">
            <el-image
              v-for="(img, index) in post.images"
              :key="index"
              :src="img"
              :preview-src-list="post.images"
              fit="cover"
            />
          </div>
        </div>
        
        <!-- 操作栏 -->
        <div class="post-actions">
          <el-button @click="handleLike">
            <el-icon><Star /></el-icon> 点赞 ({{ post.likeCount || 0 }})
          </el-button>
          <el-button @click="handleFavorite">
            <el-icon><StarFilled /></el-icon> 收藏
          </el-button>
          <el-button @click="handleShare">
            <el-icon><Share /></el-icon> 分享
          </el-button>
          <el-button type="danger" v-if="userStore.userInfo.id === post.authorId" @click="handleDelete">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </div>
      </el-card>
      
      <!-- 评论区 -->
      <el-card class="comment-card">
        <h3 class="comment-title">评论 ({{ comments.length }})</h3>
        
        <!-- 发表评论 -->
        <div class="comment-input">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的想法..."
          />
          <el-button type="primary" style="margin-top: 10px;" @click="submitComment">
            发表评论
          </el-button>
        </div>
        
        <!-- 评论列表 -->
        <div class="comment-list">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <el-avatar :src="comment.authorAvatar" :size="40" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="commenter-name">{{ comment.authorName }}</span>
                <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              
              <div class="comment-actions">
                <el-button type="text" size="small" @click="likeComment(comment)">
                  点赞 ({{ comment.likeCount || 0 }})
                </el-button>
                <el-button type="text" size="small" @click="replyComment(comment)">
                  回复
                </el-button>
              </div>
              
              <div class="replies" v-if="comment.replies && comment.replies.length">
                <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                  <el-avatar :src="reply.authorAvatar" :size="24" />
                  <div class="reply-content">
                    <span class="reply-author">{{ reply.authorName }}</span>
                    ：{{ reply.content }}
                  </div>
                  <div class="reply-time">{{ formatTime(reply.createTime) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 回复对话框 -->
        <el-dialog v-model="showReplyDialog" title="回复评论" width="500px">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="请输入回复内容"
          />
          <template #footer>
            <el-button @click="cancelReply">取消</el-button>
            <el-button type="primary" @click="submitReply">提交</el-button>
          </template>
        </el-dialog>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { addFriend, getFriendRequests } from '@/api/friend'
import { getPostDetail, getComments, createComment, createReply, deletePost, toggleLike, toggleFavorite } from '@/api/forum'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref({
  id: '',
  title: '加载中...',
  content: '',
  category: '',
  authorName: '',
  authorAvatar: '',
  createTime: '',
  views: 0,
  likes: 0,
  likeCount: 0,
  userLiked: false,
  userFavorited: false,
  images: []
})

const comments = ref([])
const newComment = ref('')
const friendRequestStatus = ref('none')
const showReplyDialog = ref(false)
const replyContent = ref('')
const replyToComment = ref(null)
const loading = ref(false)

const loadPost = async () => {
  loading.value = true
  try {
    const userId = userStore.userInfo.id
    const res = await getPostDetail(route.params.id, userId)
    post.value = res.data
    
    const commentsRes = await getComments(route.params.id, userId)
    comments.value = commentsRes.data
    
    if (userId && post.value.authorId && post.value.authorId !== userId) {
      const requestsRes = await getFriendRequests(userId, 'sent')
      const sentRequests = requestsRes.data || []
      const hasSent = sentRequests.some(r => r.fromUserId == post.value.authorId)
      if (hasSent) {
        friendRequestStatus.value = 'pending'
      }
    }
  } catch (error) {
    console.error('加载帖子失败:', error)
    ElMessage.info('帖子不存在')
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return minutes + '分钟前'
  if (hours < 24) return hours + '小时前'
  if (days < 7) return days + '天前'
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadPost()
})

// 方法
const handleLike = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    const res = await toggleLike({
      targetId: post.value.id,
      targetType: 'post',
      userId: userStore.userInfo.id
    })
    
    post.value.userLiked = res.data.isLiked
    post.value.likeCount = res.data.likeCount
    
    ElMessage.success(res.data.isLiked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const handleFavorite = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    const res = await toggleFavorite({
      targetId: post.value.id,
      targetType: 'post',
      userId: userStore.userInfo.id
    })
    
    post.value.userFavorited = res.data.isFavorited
    
    ElMessage.success(res.data.isFavorited ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const handleShare = () => {
  ElMessage.success('链接已复制')
}

const handleDelete = async () => {
  try {
    await deletePost(post.value.id, userStore.userInfo.id)
    ElMessage.success('删除成功')
    router.push('/forum')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.info('删除失败')
  }
}

const handleAddFriend = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    await addFriend({
      userId: userStore.userInfo.id,
      friendId: post.value.authorId
    })
    ElMessage.success('好友请求已发送，等待对方同意')
  } catch (error) {
    console.error('添加好友失败:', error)
  }
}

const submitComment = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    const res = await createComment({
      postId: route.params.id,
      content: newComment.value,
      authorId: userStore.userInfo.id,
      authorName: userStore.userInfo.username
    })
    
    comments.value.unshift(res.data)
    newComment.value = ''
    ElMessage.success('评论成功')
  } catch (error) {
    console.error('评论失败:', error)
  }
}

const likeComment = async (comment) => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    const res = await toggleLike({
      targetId: comment.id,
      targetType: 'comment',
      userId: userStore.userInfo.id
    })
    
    comment.userLiked = res.data.isLiked
    comment.likeCount = res.data.likeCount
    
    ElMessage.success(res.data.isLiked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const replyComment = (comment) => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  replyToComment.value = comment
  showReplyDialog.value = true
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  try {
    const res = await createReply({
      commentId: replyToComment.value.id,
      content: replyContent.value,
      authorId: userStore.userInfo.id,
      authorName: userStore.userInfo.username
    })
    
    if (!replyToComment.value.replies) {
      replyToComment.value.replies = []
    }
    replyToComment.value.replies.push(res.data)
    
    showReplyDialog.value = false
    replyContent.value = ''
    replyToComment.value = null
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复失败:', error)
  }
}

const cancelReply = () => {
  showReplyDialog.value = false
  replyContent.value = ''
  replyToComment.value = null
}
</script>

<style scoped lang="scss">
.forum-detail {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.post-card {
  margin-bottom: 20px;
  
  .post-content {
    .post-title {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
    }
    
    .post-meta {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
      
      .meta-info {
        flex: 1;
        
        .author-name {
          font-size: 14px;
          color: #333;
          margin-bottom: 5px;
        }
        
        .meta-details {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #999;
          align-items: center;
        }
      }
    }
    
    .post-body {
      line-height: 1.8;
      color: #333;
      font-size: 16px;
      
      blockquote {
        background: #f5f7fa;
        border-left: 4px solid #C81D25;
        padding: 15px 20px;
        margin: 15px 0;
        color: #666;
      }
    }
    
    .post-images {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      
      :deep(.el-image) {
        width: 100%;
        height: 200px;
        border-radius: 4px;
      }
    }
  }
  
  .post-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 15px;
  }
}

.comment-card {
  .comment-title {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
  }
  
  .comment-input {
    margin-bottom: 30px;
  }
  
  .comment-list {
    .comment-item {
      display: flex;
      gap: 15px;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-content {
        flex: 1;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          
          .commenter-name {
            font-size: 14px;
            color: #333;
            font-weight: bold;
          }
          
          .comment-time {
            font-size: 13px;
            color: #999;
          }
        }
        
        .comment-text {
          line-height: 1.6;
          color: #666;
          margin-bottom: 10px;
        }
        
        .comment-actions {
          display: flex;
          gap: 15px;
        }
        
        .replies {
          margin-top: 15px;
          padding: 15px;
          background: #f5f7fa;
          border-radius: 4px;
          
          .reply-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .el-avatar {
              margin-right: 10px;
              flex-shrink: 0;
            }
            
            .reply-content {
              flex: 1;
              color: #666;
              font-size: 14px;
              line-height: 1.5;
              
              .reply-author {
                color: #C81D25;
                font-weight: bold;
                margin-right: 5px;
              }
              
              .reply-to {
                color: #409EFF;
              }
            }
            
            .reply-time {
              font-size: 12px;
              color: #999;
              margin-left: 10px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}
</style>
