export type Lang = 'ko' | 'en'

const dict: Record<string, Record<Lang, string>> = {
  // 공통
  dashboard: { ko: '대시보드', en: 'Dashboard' },
  send: { ko: 'SEND', en: 'SEND' },
  fetch: { ko: 'FETCH', en: 'FETCH' },
  refresh: { ko: '조회', en: 'Refresh' },
  search: { ko: '검색', en: 'Search' },
  autoOn: { ko: 'Auto ON', en: 'Auto ON' },
  autoOff: { ko: 'Auto OFF', en: 'Auto OFF' },
  retransmit: { ko: '재전송', en: 'Retransmit' },
  tableName: { ko: 'Table', en: 'Table' },
  lastSyncTime: { ko: '최종 시간', en: 'Last Sync' },
  errorCount: { ko: '오류 건수', en: 'Errors' },
  pendingCount: { ko: '대기 건수', en: 'Pending' },
  dataCount: { ko: '데이터 건수', en: 'Data Count' },
  // 상태 카드
  clientStatus: { ko: 'Client 상태', en: 'Status' },
  startTime: { ko: '시작 시간', en: 'Start Time' },
  uptime: { ko: '동작 시간', en: 'Uptime' },
  totalErrors: { ko: '전체 오류', en: 'Total Errors' },
  // SEND
  selectTable: { ko: 'Table 선택', en: 'Select Table' },
  pendingRows: { ko: '대기', en: 'Pending' },
  errorRows: { ko: '에러', en: 'Errors' },
  retransmitSelected: { ko: '선택 재전송', en: 'Retransmit Selected' },
  retransmitAll: { ko: '에러 ROW 재전송 (전체)', en: 'Retransmit All Errors' },
  autoRetransmit: { ko: '자동 재전송', en: 'Auto Retransmit' },
  errorList: { ko: '에러 목록', en: 'Error List' },
  status: { ko: '상태', en: 'Status' },
  errorCode: { ko: '에러 코드', en: 'Error Code' },
  errorMessage: { ko: '에러 메시지', en: 'Error Message' },
  errorDetail: { ko: '에러 메시지 상세', en: 'Error Detail' },
  createdAt: { ko: '생성 시간', en: 'Created At' },
  noErrors: { ko: '에러 데이터가 없습니다.', en: 'No error data.' },
  selectAndSearch: { ko: 'Table을 선택하고 검색하세요.', en: 'Select a table and search.' },
  // FETCH
  receivedData: { ko: '수신 데이터', en: 'Received Data' },
  receivedAt: { ko: '수신 시간', en: 'Received At' },
  noData: { ko: '데이터가 없습니다.', en: 'No data.' },
  ifStatusSend: { ko: 'I/F 현황 — SEND', en: 'I/F Status — SEND' },
  ifStatusFetch: { ko: 'I/F 현황 — FETCH', en: 'I/F Status — FETCH' },
  lastQueried: { ko: '최종 조회', en: 'Last queried' },
  // 기타
  darkMode: { ko: '다크 모드', en: 'Dark Mode' },
  lightMode: { ko: '라이트 모드', en: 'Light Mode' },
  ifClientMonitor: { ko: 'I/F Monitor', en: 'I/F Monitor' },
  confirmRetransmit: { ko: '선택 테이블의 에러를 재전송할까요?', en: 'Retransmit errors for selected table?' },
  noTableSelected: { ko: '선택된 테이블이 없습니다.', en: 'No table selected.' },
}

export function translate(key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? key
}
