import request from '@/utils/request'

export function getCultures() {
  return request({
    url: '/cultures',
    method: 'get'
  })
}

export function getCultureDetail(id) {
  return request({
    url: `/culture/${id}`,
    method: 'get'
  })
}

export function createCulture(data) {
  return request({
    url: '/culture',
    method: 'post',
    data
  })
}

export function deleteCulture(id, userId) {
  return request({
    url: `/culture/${id}`,
    method: 'delete',
    params: { userId }
  })
}

export function getActivities() {
  return request({
    url: '/activities',
    method: 'get'
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

export function deleteActivity(id, userId) {
  return request({
    url: `/activity/${id}`,
    method: 'delete',
    params: { userId }
  })
}
