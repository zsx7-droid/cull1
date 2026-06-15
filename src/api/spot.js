import request from '@/utils/request'

export function getSpots(category) {
  return request({
    url: '/spots',
    method: 'get',
    params: { category }
  })
}

export function getSpotDetail(id) {
  return request({
    url: `/spot/${id}`,
    method: 'get'
  })
}
