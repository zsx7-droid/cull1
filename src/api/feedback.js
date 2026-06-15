import request from '@/utils/request'

export function submitFeedback(data) {
  return request({
    url: '/feedback',
    method: 'post',
    data
  })
}

export function getFeedbacks(userId) {
  return request({
    url: '/feedbacks',
    method: 'get',
    params: { userId }
  })
}

export function getAllFeedbacks() {
  return request({
    url: '/feedbacks',
    method: 'get'
  })
}
