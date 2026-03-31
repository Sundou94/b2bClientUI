import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import Fetch from './pages/Fetch'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: Infinity,       // 자동 stale 처리 비활성화
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 갱신 비활성화
      refetchOnMount: false,       // 마운트 시 자동 갱신 비활성화
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="send" element={<Send />} />
            <Route path="fetch" element={<Fetch />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
