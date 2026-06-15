<template>
  <div class="login">
    <div class="login-bg"></div>
    
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="" />
          <h2>浙江畲族文化平台</h2>
          <p>欢迎登录</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名/手机号"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary">忘记密码？</el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
          
          <div class="register-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </el-form>
        
        <div class="other-login">
          <el-divider>其他登录方式</el-divider>
          <div class="social-login">
            <el-icon class="social-icon"><ChatDotRound /></el-icon>
            <el-icon class="social-icon"><Phone /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)

// 验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        const userInfo = {
          id: res.data.id,
          username: res.data.username,
          phone: res.data.phone,
          role: res.data.role || 'user',
          nickname: res.data.nickname || res.data.username,
          avatar: res.data.avatar || '',
          bio: res.data.bio || ''
        }
        
        userStore.setUserInfo(userInfo)
        userStore.setToken(res.data.token || 'token_' + res.data.id)
        
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .login-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #C81D25 0%, #1E3A8A 100%);
    opacity: 0.9;
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    img {
      width: 60px;
      height: 60px;
      margin-bottom: 15px;
    }
    
    h2 {
      font-size: 24px;
      color: #C81D25;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      font-size: 14px;
    }
  }
  
  .login-form {
    .form-options {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .register-link {
      text-align: center;
      margin-top: 15px;
      font-size: 14px;
      
      a {
        color: #C81D25;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  
  .other-login {
    margin-top: 30px;
    
    .social-login {
      display: flex;
      justify-content: center;
      gap: 30px;
      
      .social-icon {
        font-size: 32px;
        color: #666;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
          color: #C81D25;
        }
      }
    }
  }
}
</style>
