import request from '@/utils/request'

export function getTransactions(userId) {
  return request({
    url: '/transactions',
    method: 'get',
    params: { userId }
  })
}
