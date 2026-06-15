<template>
  <div class="forum-list">
    <Header />
    
    <div class="container">
      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <el-select v-model="searchType" style="width: 120px">
          <el-option label="帖子内容" value="content" />
          <el-option label="发布者" value="author" />
          <el-option label="分类" value="category" />
        </el-select>
        <el-input
          v-model="keyword"
          :placeholder="getPlaceholder()"
          prefix-icon="Search"
          style="width: 400px"
          clearable
          @keyup.enter="loadPosts"
          @clear="loadPosts"
        />
        
        <el-button type="primary" @click="loadPosts">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon> 发布帖子
        </el-button>
      </div>
      
      <!-- 分类和排序 -->
      <div class="filter-bar">
        <el-tabs v-model="activeCategory">
          <el-tab-pane label="最新" name="latest" />
          <el-tab-pane label="精华" name="essence" />
          <el-tab-pane label="山歌交流" name="山歌" />
          <el-tab-pane label="彩带编织" name="彩带" />
          <el-tab-pane label="刺绣技艺" name="刺绣" />
          <el-tab-pane label="服饰文化" name="服饰" />
        </el-tabs>
      </div>
      
      <!-- 帖子列表 -->
      <div class="post-list">
        <div class="post-item" v-for="post in postList" :key="post.id" @click="goToDetail(post.id)">
          <el-card shadow="hover">
            <div class="post-content">
              <div class="post-header">
                <el-avatar :src="post.authorAvatar" :size="40" />
                <div class="author-info">
                  <div class="author-name">{{ post.authorName }}</div>
                  <div class="post-meta">
                    <span>{{ post.createTime }}</span>
                    <el-tag size="small" :type="getCategoryType(post.category)">{{ post.category }}</el-tag>
                  </div>
                </div>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.views }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.replyCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
                  <span><el-icon><StarFilled /></el-icon> {{ post.favoriteCount || 0 }}</span>
                </div>
              </div>
              
              <h3 class="post-title">
                <el-tag v-if="post.isTop" type="danger" size="small">置顶</el-tag>
                <el-tag v-if="post.isEssence" type="success" size="small">精华</el-tag>
                {{ post.title }}
              </h3>
              
              <p class="post-excerpt">{{ post.excerpt }}</p>
              
              <div class="post-images" v-if="post.images && post.images.length">
                <img v-for="(img, index) in post.images.slice(0, 3)" :key="index" :src="img" alt="" />
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
    
    <!-- 发帖对话框 -->
    <el-dialog v-model="showCreateDialog" title="发布帖子" width="600px">
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="postForm.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="分类" required>
          <el-select v-model="postForm.category" placeholder="请选择分类">
            <el-option label="山歌交流" value="山歌" />
            <el-option label="彩带编织" value="彩带" />
            <el-option label="刺绣技艺" value="刺绣" />
            <el-option label="服饰文化" value="服饰" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容" required>
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="分享你的想法..."
          />
        </el-form-item>
        
        <el-form-item label="上传图片">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :file-list="postForm.images"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createPost">发布</el-button>
      </template>
    </el-dialog>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { getPosts, createPost as submitPost } from '@/api/forum'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 数据
const keyword = ref('')
const searchType = ref('content')

const getPlaceholder = () => {
  return searchType.value === 'author' ? '搜索发布者名称...' : 
         searchType.value === 'category' ? '搜索分类名称...' : '搜索帖子内容...'
}

const activeCategory = ref('latest')
const showCreateDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const postList = ref([])
const loading = ref(false)

// 发帖表单
const postForm = ref({
  title: '',
  category: '',
  content: '',
  images: []
})

const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      category: activeCategory.value,
      keyword: keyword.value,
      searchType: searchType.value,
      page: currentPage.value,
      size: pageSize.value
    }
    console.log('搜索参数:', params)
    const res = await getPosts(params)
    postList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('加载帖子失败:', error)
  } finally {
    loading.value = false
  }
}

watch(activeCategory, () => {
  currentPage.value = 1
  loadPosts()
})

onMounted(() => {
  loadPosts()
})

// 方法
const getCategoryType = (category) => {
  const map = {
    '山歌': 'success',
    '彩带': 'warning',
    '刺绣': 'danger',
    '服饰': 'primary'
  }
  return map[category] || ''
}

const goToDetail = (id) => {
  router.push(`/forum/${id}`)
}

const createPost = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (!postForm.value.title || !postForm.value.content || !postForm.value.category) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  try {
    await submitPost({
      title: postForm.value.title,
      content: postForm.value.content,
      category: postForm.value.category,
      authorId: userStore.userInfo.id,
      authorName: userStore.userInfo.username
    })
    ElMessage.success('发布成功')
    showCreateDialog.value = false
    postForm.value = { title: '', category: '', content: '', images: [] }
    loadPosts()
  } catch (error) {
    console.error('发布失败:', error)
  }
}
</script>

<style scoped lang="scss">
.forum-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.filter-bar {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.post-list {
  .post-item {
    margin-bottom: 15px;
    cursor: pointer;
    
    :deep(.el-card__body) {
      padding: 20px;
    }
    
    &:hover {
      box-shadow: 0 4px 12px rgba(200, 29, 37, 0.1);
    }
    
    .post-content {
      .post-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        
        .author-info {
          flex: 1;
          
          .author-name {
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
          }
          
          .post-meta {
            display: flex;
            gap: 10px;
            font-size: 13px;
            color: #999;
          }
        }
        
        .post-stats {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #999;
        }
      }
      
      .post-title {
        font-size: 18px;
        color: #333;
        margin-bottom: 10px;
        
        .el-tag {
          margin-right: 8px;
        }
      }
      
      .post-excerpt {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 15px;
      }
      
      .post-images {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        
        img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
        }
      }
    }
  }
}

.pagination {
  text-align: center;
  margin-top: 30px;
}
</style>
