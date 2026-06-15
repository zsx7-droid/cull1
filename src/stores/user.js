import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const token = ref(localStorage.getItem('token') || '')
  const cartCount = ref(0)

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setCartCount = (count) => {
    cartCount.value = count
  }

  const logout = () => {
    userInfo.value = {}
    token.value = ''
    cartCount.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    userInfo,
    token,
    cartCount,
    setUserInfo,
    setToken,
    setCartCount,
    logout
  }
})
