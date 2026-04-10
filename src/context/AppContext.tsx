import { createContext, useContext, useState, type ReactNode } from 'react'
import { translate, type Lang } from './i18n'

interface AppContextValue {
  isDark: boolean
  setIsDark: (v: boolean) => void
  lang: Lang
  setLang: (v: Lang) => void
  t: (key: string) => string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const [lang, setLang] = useState<Lang>('en')

  const t = (key: string) => translate(key, lang)

  return (
    <AppContext.Provider value={{ isDark, setIsDark, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
