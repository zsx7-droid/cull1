<template>
  <div class="publish-culture">
    <Header />
    
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">发布文化内容</span>
          </div>
        </template>
        
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
          
          <el-form-item label="类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择类型">
              <el-option label="文化介绍" value="culture" />
              <el-option label="传统习俗" value="custom" />
              <el-option label="民间艺术" value="art" />
              <el-option label="历史故事" value="history" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="内容" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="8"
              placeholder="请输入内容"
            />
          </el-form-item>
          
          <el-form-item label="图片">
            <div class="image-upload">
              <el-upload
                v-if="form.images.length < 5"
                class="upload-btn"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleImageSuccess"
              >
                <el-button type="primary">上传图片</el-button>
              </el-upload>
              <div class="image-list">
                <div v-for="(img, index) in form.images" :key="index" class="image-item">
                  <img :src="img" />
                  <el-icon class="delete-btn" @click="removeImage(index)"><Delete /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">发布</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { createCulture } from '@/api/culture'

const router = useRouter()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  title: '',
  type: 'culture',
  content: '',
  images: []
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const handleImageSuccess = (response) => {
  form.images.push(response.url)
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (!userInfo.id) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      
      loading.value = true
      try {
        await createCulture({
          title: form.title,
          content: form.content,
          type: form.type,
          images: form.images,
          userId: userInfo.id
        })
        
        ElMessage.success('发布成功')
        router.push('/culture')
      } catch (error) {
        console.error('发布失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.images = []
}

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<style scoped lang="scss">
.publish-culture {
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

.el-select {
  width: 100%;
}

.image-upload {
  .upload-btn {
    margin-bottom: 10px;
  }
  
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .image-item {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 50%;
        padding: 5px;
        cursor: pointer;
        
        &:hover {
          background: rgba(200, 29, 37, 0.8);
        }
      }
    }
  }
}
</style>
