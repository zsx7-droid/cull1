import axios from 'axios'
import { ElMessage } from 'element-plus'

const apiBase = import.meta.env.VITE_API_BASE_URL
const request = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('响应:', response.config.url, response.data)
    const res = response.data
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'info',
        duration: 3000,
        showClose: true
      })
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('请求错误:', error)
    const msg = error.response?.data?.message || error.message || '网络错误'
    ElMessage({
      message: msg,
      type: 'info',
      duration: 3000,
      showClose: true
    })
    return Promise.reject(error)
  }
)

export default request
