<template>
  <div class="publish-product">
    <Header />
    
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">发布商品</span>
          </div>
        </template>
        
        <el-form :model="productForm" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productForm.name" placeholder="请输入商品名称" />
          </el-form-item>
          
          <el-form-item label="商品分类" prop="category">
            <el-select v-model="productForm.category" placeholder="请选择分类">
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.name"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="商品价格" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2" />
            <span class="unit">元</span>
          </el-form-item>
          
          <el-form-item label="商品库存" prop="stock">
            <el-input-number v-model="productForm.stock" :min="0" />
            <span class="unit">件</span>
          </el-form-item>
          
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="productForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述"
            />
          </el-form-item>
          
          <el-form-item label="商品图片">
            <div class="image-upload">
              <el-upload
                v-if="productForm.images.length < 5"
                class="upload-btn"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleImageSuccess"
              >
                <el-button type="primary">上传图片</el-button>
              </el-upload>
              <div class="image-list">
                <div v-for="(img, index) in productForm.images" :key="index" class="image-item">
                  <img :src="img" />
                  <el-icon class="delete-btn" @click="removeImage(index)"><Delete /></el-icon>
                </div>
              </div>
            </div>
            <div class="tips">最多上传5张图片</div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">发布商品</el-button>
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
import { getCategories, createProduct } from '@/api/shop'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const categories = ref([
  { id: 1, name: '畲族服饰' },
  { id: 2, name: '畲族银饰' },
  { id: 3, name: '织彩带与布艺' },
  { id: 4, name: '竹编木艺工艺' },
  { id: 5, name: '特色食品茶饮' },
  { id: 6, name: '文创潮流周边' },
  { id: 7, name: '民俗节庆用品' }
])
const loading = ref(false)

const productForm = reactive({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  images: []
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleImageSuccess = (response) => {
  productForm.images.push(response.url)
}

const removeImage = (index) => {
  productForm.images.splice(index, 1)
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await createProduct({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          stock: productForm.stock,
          category: productForm.category,
          images: productForm.images,
          sellerId: userStore.userInfo.id,
          sellerName: userStore.userInfo.username
        })
        
        ElMessage.success('发布成功')
        router.push('/shop')
      } catch (error) {
        console.error('发布失败:', error)
        ElMessage.error('发布失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  productForm.images = []
}

onMounted(() => {
})
</script>

<style scoped lang="scss">
.publish-product {
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

.unit {
  margin-left: 10px;
  color: #666;
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

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
