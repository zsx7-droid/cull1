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

export function deleteCulture(id) {
  return request({
    url: `/culture/${id}`,
    method: 'delete'
  })
}
