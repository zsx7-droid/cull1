import request from '@/utils/request'

export function sendSms(phone) {
  return request({
    url: '/sms/send',
    method: 'post',
    data: { phone }
  })
}

export function verifySms(phone, code) {
  return request({
    url: '/sms/verify',
    method: 'post',
    data: { phone, code }
  })
}
