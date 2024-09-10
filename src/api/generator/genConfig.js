import request from '@/utils/request'

export function get(tableName, dataBaseId) {
  console.log('get: dataBaseId:' + dataBaseId)
  return request({
    url: 'api/genConfig/' + tableName + '/' + dataBaseId,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: 'api/genConfig',
    data,
    method: 'put'
  })
}
