export type Lang = 'ko' | 'en'

const dict: Record<string, Record<Lang, string>> = {
  dashboard:       { ko: '대시보드',           en: 'Dashboard' },
  ifSummary:       { ko: 'I/F 현황',           en: 'I/F Summary' },
  refresh:         { ko: '조회',               en: 'Refresh' },
  autoOn:          { ko: 'Auto ON',            en: 'Auto ON' },
  autoOff:         { ko: 'Auto OFF',           en: 'Auto OFF' },
  retransmit:      { ko: '재전송',             en: 'Retransmit' },
  clientStatus:    { ko: 'Client 상태',        en: 'Status' },
  startTime:       { ko: '시작 시간',           en: 'Start Time' },
  totalErrors:     { ko: '전체 오류',           en: 'Total Errors' },
  ifStatusSend:    { ko: 'I/F 현황 — SEND',   en: 'I/F Status — SEND' },
  ifStatusFetch:   { ko: 'I/F 현황 — FETCH',  en: 'I/F Status — FETCH' },
  lastQueried:     { ko: '최종 조회',           en: 'Last queried' },
  darkMode:        { ko: '다크 모드',           en: 'Dark Mode' },
  lightMode:       { ko: '라이트 모드',         en: 'Light Mode' },
  ifClientMonitor: { ko: 'I/F Monitor',        en: 'I/F Monitor' },
}

export function translate(key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? key
}
