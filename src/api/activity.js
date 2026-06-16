import request from '@/utils/request'

export function getActivityList(type) {
  return request({
    url: '/activities',
    method: 'get',
    params: { type }
  })
}

export function getActivityDetail(id) {
  return request({
    url: `/activity/${id}`,
    method: 'get'
  })
}

export function createActivity(data) {
  return request({
    url: '/activity',
    method: 'post',
    data
  })
}

export function updateActivity(id, data) {
  return request({
    url: `/activity/${id}`,
    method: 'put',
    data
  })
}

export function deleteActivity(id) {
  return request({
    url: `/activity/${id}`,
    method: 'delete'
  })
}

export function registerActivity(data) {
  return request({
    url: '/registration',
    method: 'post',
    data
  })
}

export function getAllRegistrations() {
  return request({
    url: '/registrations',
    method: 'get'
  })
}

export function getMyActivities(userId) {
  return request({
    url: '/registrations',
    method: 'get',
    params: { userId }
  })
}
