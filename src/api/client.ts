import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// 개발 환경에서 mock 인터셉터 활성화
if (import.meta.env.DEV) {
  import('../mocks/handler').then(({ setupMockInterceptor }) => {
    setupMockInterceptor(apiClient)
  })
}

export default apiClient
