import request from '@/utils/request'

export function getMessages(userId, friendId) {
  return request({
    url: '/messages',
    method: 'get',
    params: { userId, friendId }
  })
}

export function getConversations(userId) {
  return request({
    url: '/messages',
    method: 'get',
    params: { userId }
  })
}

export function sendMessage(data) {
  return request({
    url: '/messages',
    method: 'post',
    data
  })
}

export function markAsRead(userId, friendId) {
  return request({
    url: '/messages/read',
    method: 'put',
    data: { userId, friendId }
  })
}
