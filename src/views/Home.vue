<template>
  <div class="home">
    <Header />

    <!-- Banner轮播 -->
    <section class="banner-section">
      <el-carousel height="550px" indicator-position="outside" :interval="5000" arrow="always">
        <el-carousel-item v-for="(item, index) in banners" :key="index">
          <div class="banner-item" :style="{ backgroundImage: item.image ? `url(${item.image})` : 'linear-gradient(135deg, #1E3A8A 0%, #C81D25 50%, #F59E0B 100%)' }">
            <div class="banner-content">
              <h1 class="banner-title">{{ item.title }}</h1>
              <p class="banner-desc">{{ item.description }}</p>
              <el-button type="primary" size="large" class="banner-btn" @click="handleBannerClick(item)">
                {{ item.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 畲族文化简介 -->
    <section class="intro-section">
      <div class="container">
        <h2 class="section-title">畲族文化简介</h2>
        <div class="intro-content">
          <div class="intro-image">
            <img src="/images/1.png" alt="畲族文化" style="background: linear-gradient(135deg, #1E3A8A, #C81D25); width: 100%; height: 400px; display: block;" />
          </div>
          <div class="intro-text">
            <h3>千年传承，多彩畲乡</h3>
            <p>
              畲族是中国南方的一个少数民族，主要分布在浙江、福建、江西等地。浙江省畲族人口约20万，
              主要居住在丽水、温州、金华等山区县市。畲族有着悠久的历史和灿烂的文化，山歌、彩带、
              刺绣、服饰等非物质文化遗产世代相传。
            </p>
            <p>
              本平台致力于畲族文化的数字化展示与传承，为畲族传承人、手工艺人和爱好者提供交流互动
              和产品展示交易的一体化服务平台。
            </p>
            <el-button type="primary" @click="showIntroDetail">了解更多</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 文化展示推荐 -->
    <section class="culture-section">
      <div class="container">
        <h2 class="section-title">文化精选</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="item in cultureList" :key="item.id">
            <el-card class="culture-card" shadow="hover" @click="showCultureDetail(item)">
              <img :src="item.images?.[0]" :alt="item.title" class="card-image" />
              <div class="card-content">
                <el-tag size="small" :type="getCategoryType(item.type)">{{ item.type }}</el-tag>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.content?.substring(0, 50) }}...</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div class="more-btn">
          <el-button size="large" @click="$router.push('/culture')">查看更多</el-button>
        </div>
      </div>
    </section>

    <!-- 热门商品 -->
    <section class="shop-section">
      <div class="container">
        <h2 class="section-title">文创精品</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="item in productList" :key="item.id">
            <el-card class="product-card" shadow="hover" @click="showProductDetail(item)">
              <img :src="item.images?.[0]" :alt="item.name" class="card-image" />
              <div class="card-content">
                <el-tag size="small">{{ item.category }}</el-tag>
                <h3 class="card-title">{{ item.name }}</h3>
                <p class="card-desc">{{ item.description?.substring(0, 30) }}...</p>
                <div class="price-section">
                  <span class="price">¥{{ item.price }}</span>
                  <span class="sales">库存: {{ item.stock }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div class="more-btn">
          <el-button size="large" @click="$router.push('/shop')">浏览更多</el-button>
        </div>
      </div>
    </section>

    <!-- 近期活动 -->
    <section class="activity-section">
      <div class="container">
        <h2 class="section-title">近期活动</h2>
        <el-row :gutter="20">
          <el-col :span="24" v-for="item in activityList" :key="item.id">
            <el-card class="activity-card" shadow="hover" @click="showActivityDetail(item)">
              <div class="activity-content">
                <img :src="item.images?.[0]" :alt="item.title" class="activity-image" />
                <div class="activity-info">
                  <h3>{{ item.title }}</h3>
                  <p><el-icon><Calendar /></el-icon> {{ item.time }}</p>
                  <p><el-icon><Location /></el-icon> {{ item.location }}</p>
                  <p>{{ item.content?.substring(0, 100) }}...</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <div class="dialog-content" v-if="currentItem">
        <img v-if="currentItem.images?.[0] || currentItem.image" :src="currentItem.images?.[0] || currentItem.image" class="dialog-image" />
        <div class="dialog-info">
          <p v-if="currentItem.type"><strong>分类：</strong>{{ currentItem.type }}</p>
          <p v-if="currentItem.content"><strong>简介：</strong>{{ currentItem.content?.substring(0, 200) }}...</p>
          <p v-if="currentItem.category"><strong>分类：</strong>{{ currentItem.category }}</p>
          <p v-if="currentItem.description"><strong>描述：</strong>{{ currentItem.description }}</p>
          <p v-if="currentItem.price"><strong>价格：</strong>¥{{ currentItem.price }}</p>
          <p v-if="currentItem.stock"><strong>库存：</strong>{{ currentItem.stock }} 件</p>
          <p v-if="currentItem.sales"><strong>销量：</strong>{{ currentItem.sales }}</p>
          <p v-if="currentItem.sellerName"><strong>卖家：</strong>{{ currentItem.sellerName }}</p>
          <p v-if="currentItem.startTime"><strong>时间：</strong>{{ currentItem.startTime }}</p>
          <p v-if="currentItem.location"><strong>地点：</strong>{{ currentItem.location }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToDetail">查看详情</el-button>
      </template>
    </el-dialog>

    <!-- 文化简介弹窗 -->
    <el-dialog v-model="introDialogVisible" title="畲族文化简介" width="800px" destroy-on-close>
      <div class="intro-dialog">
        <h3>千年传承，多彩畲乡</h3>
        <p>畲族是中国南方的一个少数民族，主要分布在浙江、福建、江西等地。浙江省畲族人口约20万，主要居住在丽水、温州、金华等山区县市。</p>
        <h4>主要文化特征：</h4>
        <ul>
          <li><strong>畲族山歌</strong> - 国家级非物质文化遗产，畲族人民口头文学的重要组成部分</li>
          <li><strong>畲族彩带</strong> - 传统手工艺品，具有驱邪祈福的寓意</li>
          <li><strong>畲族刺绣</strong> - 独特的民族刺绣技艺，图案精美</li>
          <li><strong>畲族服饰</strong> - 传统民族服装，以凤凰装最为著名</li>
          <li><strong>三月三节日</strong> - 畲族最重要的传统节日</li>
        </ul>
        <h4>分布区域：</h4>
        <p>浙江省是畲族主要聚居地之一，主要分布在丽水市（景宁畲族自治县）、温州市（金华、泰顺、文成）、金华市（兰溪、武义）等山区县市。</p>
        <h4>本平台：</h4>
        <p>致力于畲族文化的数字化展示与传承，为畲族传承人、手工艺人和爱好者提供交流互动和产品展示交易的一体化服务平台。</p>
      </div>
      <template #footer>
        <el-button @click="introDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="$router.push('/culture'); introDialogVisible = false">查看更多文化</el-button>
      </template>
    </el-dialog>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getCultures } from '@/api/culture'
import { getProducts } from '@/api/shop'
import { getActivities } from '@/api/culture'

const router = useRouter()

const dialogVisible = ref(false)
const introDialogVisible = ref(false)
const dialogTitle = ref('')
const currentItem = ref(null)
const currentType = ref('')

const showIntroDetail = () => {
  introDialogVisible.value = true
}

const showCultureDetail = (item) => {
  currentItem.value = item
  dialogTitle.value = item.title
  currentType.value = 'culture'
  dialogVisible.value = true
}

const handleBannerClick = (item) => {
  if (item.buttonText === '探索文化') {
    router.push('/culture')
  } else if (item.buttonText === '文化交流') {
    router.push('/forum')
  } else if (item.buttonText === '立即购买') {
    router.push('/shop')
  } else {
    showCultureDetail(item)
  }
}

const showProductDetail = (item) => {
  currentItem.value = item
  dialogTitle.value = item.name
  currentType.value = 'product'
  dialogVisible.value = true
}

const showActivityDetail = (item) => {
  currentItem.value = item
  dialogTitle.value = item.title
  currentType.value = 'activity'
  dialogVisible.value = true
}

const goToDetail = () => {
  dialogVisible.value = false
  if (currentType.value === 'culture') {
    router.push(`/culture/${currentItem.value.id}`)
  } else if (currentType.value === 'product') {
    router.push(`/product/${currentItem.value.id}`)
  } else if (currentType.value === 'activity') {
    router.push(`/activity/${currentItem.value.id}`)
  }
}

const getCategoryType = (category) => {
  const map = {
    '山歌': 'success',
    '彩带': 'warning',
    '刺绣': 'danger',
    '服饰': 'primary',
    '文化介绍': 'success',
    '传统习俗': 'warning',
    '民间艺术': 'danger',
    '历史故事': 'primary'
  }
  return map[category] || ''
}

const banners = ref([
  {
    image: '/images/carousel/2.jpg',
    title: '传承千年文化，共享畲乡风情',
    description: '',
    buttonText: '探索文化',
    content: '浙江畲族文化交流与交易平台致力于弘扬畲族文化，为传承人，手工艺人和爱好者提供交流互动平台。'
  },
  {
    image: '/images/carousel/3.jpg',
    title: '交融山海文脉，共叙畲乡雅韵',
    description: '',
    buttonText: '文化交流',
    content: '畲族彩带编织技艺是国家级非物质文化遗产，具有悠久的历史和独特的艺术价值。'
  },
  {
    image: '/images/carousel/4.jpg',
    title: '珍藏千年匠心，邂逅乡土文脉',
    description: '',
    buttonText: '立即购买',
    content: '融合传统畲族文化元素与现代设计理念，打造独具特色的文创产品。'
  }
])

const cultureList = ref([])

const loadCultureList = async () => {
  try {
    const res = await getCultures()
    cultureList.value = (res.data || []).slice(0, 4)
  } catch (error) {
    console.error('加载文化列表失败:', error)
  }
}

onMounted(() => {
  loadCultureList()
  loadProducts()
  loadActivities()
})

const productList = ref([])

const loadProducts = async () => {
  try {
    const res = await getProducts()
    console.log('商品数据:', res)
    const data = res.data?.list || res.data?.data || res.data?.products || []
    productList.value = Array.isArray(data) ? data.slice(0, 4) : []
  } catch (error) {
    console.error('加载商品列表失败:', error)
  }
}

const activityList = ref([])

const loadActivities = async () => {
  try {
    const res = await getActivities()
    const data = res.data?.data || res.data || []
    activityList.value = Array.isArray(data) ? data.slice(0, 3) : []
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  color: #C81D25;
  margin-bottom: 40px;
  position: relative;
  padding-bottom: 15px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, #C81D25, #F59E0B);
  }
}

.banner-section {
  margin-bottom: 0;
  
  .banner-item {
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
    }
    
    .banner-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 1;
      width: 80%;
      max-width: 800px;
      
      .banner-title {
        font-size: 52px;
        margin-bottom: 24px;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
        font-weight: bold;
        letter-spacing: 2px;
      }
      
      .banner-desc {
        font-size: 22px;
        margin-bottom: 36px;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        opacity: 0.95;
      }
      
      .banner-btn {
        padding: 20px 50px;
        font-size: 18px;
        border-radius: 30px;
        background: linear-gradient(135deg, #C81D25 0%, #F59E0B 100%);
        border: none;
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(200, 29, 37, 0.4);
        }
      }
    }
  }
}

.intro-section {
  padding: 60px 0;
  background: white;
  margin-bottom: 60px;
  
  .intro-content {
    display: flex;
    gap: 40px;
    align-items: center;
    
    .intro-image {
      flex: 1;
      img {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
    
    .intro-text {
      flex: 1;
      
      h3 {
        font-size: 24px;
        color: #C81D25;
        margin-bottom: 20px;
      }
      
      p {
        line-height: 1.8;
        color: #666;
        margin-bottom: 15px;
      }
    }
  }
}

.culture-section,
.shop-section {
  padding: 60px 0;
  margin-bottom: 60px;
  
  .culture-card,
  .product-card {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(200, 29, 37, 0.2);
      
      .card-image {
        transform: scale(1.08);
      }
    }
    
    :deep(.el-card__body) {
      padding: 0;
    }
    
    .card-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 0;
      transition: transform 0.5s ease;
    }
    
    .card-content {
      padding: 18px;
      background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
      
      .card-title {
        font-size: 17px;
        margin: 10px 0;
        color: #333;
        font-weight: bold;
        height: 48px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: color 0.3s;
        
        &:hover {
          color: #C81D25;
        }
      }
      
      .card-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 12px;
      }
      
      .price-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
        
        .price {
          font-size: 24px;
          color: #C81D25;
          font-weight: bold;
          font-family: 'Arial', sans-serif;
        }
        
        .sales {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
  
  .more-btn {
    text-align: center;
    margin-top: 30px;
  }
}

.activity-section {
  padding: 60px 0;
  background: white;
  margin-bottom: 60px;
  
  .activity-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(200, 29, 37, 0.15);
    }
    
    .activity-content {
      display: flex;
      gap: 20px;
      
      .activity-image {
        width: 200px;
        height: 150px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .activity-info {
        flex: 1;
        
        h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 10px;
        }
        
        p {
          color: #666;
          margin: 5px 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }
}

.dialog-content {
  .dialog-image {
    width: 100%;
    max-height: 350px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dialog-info {
    background: linear-gradient(to bottom, #fafafa, #fff);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #eee;
    
    p {
      margin: 12px 0;
      line-height: 1.8;
      color: #555;
      padding: 8px 0;
      border-bottom: 1px dashed #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      strong {
        color: #1E3A8A;
        font-weight: 600;
        min-width: 60px;
        display: inline-block;
      }
    }
  }
}

.intro-dialog {
  h3 {
    color: #C81D25;
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  h4 {
    color: #333;
    margin: 20px 0 10px;
  }
  
  p {
    line-height: 1.8;
    color: #666;
    margin-bottom: 15px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      color: #666;
      
      strong {
        color: #333;
      }
    }
  }
}

@media (max-width: 768px) {
  .intro-content {
    flex-direction: column !important;
  }
  
  .activity-content {
    flex-direction: column !important;
  }
}
</style>
