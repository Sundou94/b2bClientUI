import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import koKR from 'antd/locale/ko_KR'
import enUS from 'antd/locale/en_US'
import 'antd/dist/reset.css'
import './index.css'
import { AppProvider, useAppContext } from './context/AppContext'
import App from './App'

function ThemedApp() {
  const { isDark, lang } = useAppContext()
  return (
    <ConfigProvider
      locale={lang === 'ko' ? koKR : enUS}
      theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <App />
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  </StrictMode>,
)
