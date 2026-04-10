import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { mockClientStatus, mockLotHisIfRows } from './data'

function makeResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as InternalAxiosRequestConfig }
}

export function setupMockInterceptor(apiClient: import('axios').AxiosInstance) {
  apiClient.interceptors.request.use((config) => {
    // 요청을 실제로 보내지 않고 adapter를 교체하여 mock 응답 반환
    config.adapter = async () => {
      const url = config.url ?? ''

      if (url.includes('/client/status')) {
        return makeResponse(mockClientStatus)
      }

      if (url.includes('/lot-his-if/errors')) {
        return makeResponse(mockLotHisIfRows)
      }

      if (url.includes('/send/retransmit')) {
        const ids = (config.data ? JSON.parse(config.data) : {}).ids ?? []
        return makeResponse({ successCount: ids.length, failCount: 0, message: 'Mock 재전송 완료' })
      }

      return makeResponse(null)
    }
    return config
  })
}
