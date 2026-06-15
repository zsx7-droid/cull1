<template>
  <div class="registration-list">
    <Header />
    
    <div class="container">
      <h2 class="page-title">报名信息查询</h2>
      
      <el-card v-loading="loading">
        <el-table :data="registrations" style="width: 100%">
          <el-table-column prop="activityTitle" label="活动名称" min-width="180" />
          <el-table-column prop="userName" label="用户名称" width="120" />
          <el-table-column prop="phone" label="电话号码" width="130" />
          <el-table-column prop="createTime" label="报名时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="!loading && registrations.length === 0" description="暂无报名信息" />
      </el-card>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getAllRegistrations } from '@/api/activity'

const loading = ref(false)
const registrations = ref([])

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const loadRegistrations = async () => {
  loading.value = true
  try {
    const res = await getAllRegistrations()
    registrations.value = res.data || []
  } catch (error) {
    console.error('加载报名信息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRegistrations()
})
</script>

<style scoped lang="scss">
.registration-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}
</style>
