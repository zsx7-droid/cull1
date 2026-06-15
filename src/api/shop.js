import request from '@/utils/request'

export function getCategories() {
  return request({
    url: '/shop/categories',
    method: 'get'
  })
}

export function getProducts(params) {
  return request({
    url: '/shop/products',
    method: 'get',
    params
  })
}

export function getProductDetail(id) {
  return request({
    url: `/shop/product/${id}`,
    method: 'get'
  })
}

export function createProduct(data) {
  return request({
    url: '/shop/product',
    method: 'post',
    data
  })
}

export function addToCart(data) {
  return request({
    url: '/shop/cart',
    method: 'post',
    data
  })
}

export function getCart(userId) {
  return request({
    url: '/shop/cart',
    method: 'get',
    params: { userId }
  })
}

export function removeFromCart(id) {
  return request({
    url: `/shop/cart/${id}`,
    method: 'delete'
  })
}

export function clearCart(userId) {
  return request({
    url: '/shop/cart',
    method: 'delete',
    params: { userId }
  })
}

export function createOrder(data) {
  return request({
    url: '/shop/order',
    method: 'post',
    data
  })
}

export function getOrders(userId) {
  return request({
    url: '/shop/orders',
    method: 'get',
    params: { userId }
  })
}

export function getSellerOrders(userId) {
  return request({
    url: '/shop/seller-orders',
    method: 'get',
    params: { userId }
  })
}

export function getOrderDetail(id, userId) {
  return request({
    url: `/shop/order/${id}`,
    method: 'get',
    params: { userId }
  })
}

export function payOrder(id, userId) {
  return request({
    url: `/shop/order/${id}/pay`,
    method: 'post',
    data: { userId }
  })
}
