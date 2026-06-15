import request from '@/utils/request'

export function getFriends(userId) {
  return request({
    url: '/friends',
    method: 'get',
    params: { userId }
  })
}

export function getFriendRequests(userId, type) {
  return request({
    url: '/friend-requests',
    method: 'get',
    params: { userId, type }
  })
}

export function addFriend(data) {
  return request({
    url: '/friends',
    method: 'post',
    data
  })
}

export function removeFriend(id, action) {
  return request({
    url: `/friends/${id}`,
    method: 'delete',
    params: { action }
  })
}
