import request from '@/utils/request'

export function getPosts(params) {
  return request({
    url: '/forum/posts',
    method: 'get',
    params
  })
}

export function getPostDetail(id, userId) {
  return request({
    url: `/forum/post/${id}`,
    method: 'get',
    params: { userId }
  })
}

export function createPost(data) {
  return request({
    url: '/forum/post',
    method: 'post',
    data
  })
}

export function deletePost(id, userId) {
  return request({
    url: `/forum/post/${id}`,
    method: 'delete',
    data: { userId }
  })
}

export function getComments(postId, userId) {
  return request({
    url: `/forum/comments/${postId}`,
    method: 'get',
    params: { userId }
  })
}

export function createComment(data) {
  return request({
    url: '/forum/comment',
    method: 'post',
    data
  })
}

export function createReply(data) {
  return request({
    url: '/forum/reply',
    method: 'post',
    data
  })
}

export function toggleLike(data) {
  return request({
    url: '/forum/like',
    method: 'post',
    data
  })
}

export function toggleFavorite(data) {
  return request({
    url: '/forum/favorite',
    method: 'post',
    data
  })
}
