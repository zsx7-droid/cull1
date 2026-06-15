<template>
  <div class="register">
    <div class="register-bg"></div>
    
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="" />
          <h2>用户注册</h2>
          <p>加入畲族文化大家庭</p>
        </div>
        
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          class="register-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="手机号"
              prefix-icon="Phone"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="verifyCode">
            <div class="verify-code-input">
              <el-input
                v-model="registerForm.verifyCode"
                placeholder="验证码"
                prefix-icon="Lock"
                size="large"
                style="flex: 1"
              />
              <el-button
                size="large"
                :disabled="countdown > 0"
                @click="handleSendCode"
                :loading="sending"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              style="width: 100%"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
          
          <div class="login-link">
            已有账号？<router-link to="/login">立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/user'
import { sendSms, verifySms } from '@/api/sms'

const router = useRouter()
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  phone: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)

let countdownTimer = null

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请先输入正确的手机号')
    return
  }
  
  sending.value = true
  try {
    await sendSms(registerForm.phone)
    ElMessage.success('验证码已发送')
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.info(error.response?.data?.message || '发送失败')
  } finally {
    sending.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await verifySms(registerForm.phone, registerForm.verifyCode)
        
        await register({
          username: registerForm.username,
          phone: registerForm.phone,
          password: registerForm.password,
          role: 'user'
        })
        ElMessage.success('注册成功！请登录')
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.info(error.response?.data?.message || '注册失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.register {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .register-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1E3A8A 0%, #C81D25 100%);
    opacity: 0.9;
  }
}

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.register-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  .register-header {
    text-align: center;
    margin-bottom: 30px;
    
    img {
      width: 60px;
      height: 60px;
      margin-bottom: 15px;
    }
    
    h2 {
      font-size: 24px;
      color: #1E3A8A;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      font-size: 14px;
    }
  }
  
  .register-form {
    .verify-code-input {
      display: flex;
      gap: 10px;
      
      .el-button {
        width: 120px;
        flex-shrink: 0;
      }
    }
    
    .login-link {
      text-align: center;
      margin-top: 15px;
      font-size: 14px;
      
      a {
        color: #1E3A8A;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
