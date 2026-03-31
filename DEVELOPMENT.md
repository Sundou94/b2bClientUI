# 개발 가이드 — I/F Client Monitor

## 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [기술 스택](#기술-스택)
3. [코드 컨벤션](#코드-컨벤션)
4. [API 사용법](#api-사용법)
5. [신규 페이지 작성 절차](#신규-페이지-작성-절차)
6. [다국어(i18n) 추가](#다국어i18n-추가)

---

## 프로젝트 구조

```
src/
├── api/
│   ├── client.ts          # axios 인스턴스 (baseURL: /api, timeout: 10s)
│   └── ifClient.ts        # 전체 API 호출 함수 모음
├── context/
│   ├── AppContext.tsx      # 전역 상태 (다크모드, 언어)
│   └── i18n.ts            # ko/en 번역 딕셔너리
├── hooks/
│   └── useIFClient.ts     # TanStack Query 훅 모음
├── pages/
│   ├── Dashboard.tsx
│   ├── Send.tsx
│   └── Fetch.tsx
├── components/
│   └── AppLayout.tsx      # 사이드바 + 레이아웃 틀
├── types/
│   └── index.ts           # 전체 TypeScript 타입 정의
├── App.tsx                # 라우터 + QueryClient 설정
├── main.tsx               # 진입점, ConfigProvider (테마/로케일)
└── index.css              # 전역 CSS (overflow hidden, 에러 행 스타일)
```

---

## 기술 스택

| 역할 | 라이브러리 | 버전 |
|------|-----------|------|
| 프레임워크 | React | 18 |
| 빌드 | Vite + TypeScript | 6 / 5 |
| UI | Ant Design | 5 |
| 라우팅 | React Router | v6 |
| 데이터 패칭 | TanStack Query | v5 |
| HTTP | Axios | 1 |
| 날짜 | Day.js | 1 |

---

## 코드 컨벤션

### 파일 네이밍
- **페이지**: `PascalCase.tsx` — `Send.tsx`, `Fetch.tsx`
- **컴포넌트**: `PascalCase.tsx` — `AppLayout.tsx`
- **훅**: `camelCase.ts`, `use` 접두사 — `useIFClient.ts`
- **유틸/타입**: `camelCase.ts` — `i18n.ts`, `index.ts`

### 컴포넌트 구조 (페이지 기준)
```tsx
// 1. import — 외부 라이브러리 → 내부 모듈 순
import { useState } from 'react'
import { Card, Table } from 'antd'
import { useMyHook } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { MyType } from '../types'

// 2. 상수 (컴포넌트 외부)
const GRID_SCROLL_Y = 'calc(100vh - 192px)'

// 3. 컴포넌트 (default export)
export default function MyPage() {
  // 3-1. 컨텍스트/라우터 훅
  const { t } = useAppContext()

  // 3-2. 로컬 상태
  const [value, setValue] = useState('')

  // 3-3. 서버 상태 (TanStack Query 훅)
  const { data, isLoading } = useMyHook(value, enabled)

  // 3-4. 이벤트 핸들러
  const handleSearch = () => { ... }

  // 3-5. 파생값 (렌더 직전 계산)
  const count = data?.length ?? 0

  // 3-6. JSX
  return ( ... )
}
```

### 스타일 규칙
- 인라인 `style` prop 사용 (CSS 모듈 미사용)
- 전역 스타일은 `index.css`에만 추가
- 레이아웃 높이: `calc(100vh - Npx)` 패턴 사용, 페이지 상단에 상수로 선언
- 페이지 최상위 div: `height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'`

### 로딩 처리
- **초기 로딩**: Table `loading={isLoading}` prop으로 테이블 내부 스피너 표시
- **카드 단위 로딩**: `<Spin spinning={isLoading}>` 으로 카드 내부 처리
- **전체 페이지 Spin 사용 금지** — 레이아웃이 무너지므로 컴포넌트 단위로만 사용

### 에러 처리
- API 실패 시 `message.error()` (Ant Design) 으로 토스트 표시
- 빈 데이터는 Table `locale={{ emptyText: '...' }}` 로 처리
- 에러 상태로 전체 페이지를 교체하지 않음

---

## API 사용법

### 기본 구조

```
vite.config.ts proxy: /api → http://localhost:8080
```

모든 API 호출은 `/api` prefix 하에서 동작합니다.

---

### API 함수 (`src/api/ifClient.ts`)

```ts
import { ifClientApi } from '../api/ifClient'

// Client 상태
ifClientApi.getClientStatus()
// → ClientStatus { status, startTime, uptimeSeconds, totalErrorCount }

// SEND 요약 (Dashboard 그리드용)
ifClientApi.getSendSummary()
// → IFTableSummary[] { tableName, lastSyncTime, errorCount, pendingCount, hasError }

// FETCH 요약
ifClientApi.getFetchSummary()
// → IFTableSummary[]

// SEND 테이블 목록
ifClientApi.getSendTables()
// → IFTableItem[] { fieldName, tableName, type, enabled }

// FETCH 테이블 목록
ifClientApi.getFetchTables()
// → IFTableItem[]

// SEND 에러 Row 조회
ifClientApi.getSendErrors(tableName: string)
// → SendRow[] { id, tableName, errorFlag, errorMessage, status, createdAt, data: {} }

// SEND 재전송
ifClientApi.retransmit({ tableNames?: string[], ids?: string[] })
// → RetransmitResult { successCount, failCount, message }

// FETCH 수신 데이터 조회
ifClientApi.getFetchData(tableName, from, to)  // from/to: ISO 8601
// → FetchRow[] { id, tableName, receivedAt, data: {} }
```

---

### TanStack Query 훅 (`src/hooks/useIFClient.ts`)

컴포넌트에서는 API 함수를 직접 호출하지 않고 **훅을 통해** 사용합니다.

```tsx
import {
  useClientStatus,
  useSendSummary,
  useFetchSummary,
  useSendTables,
  useFetchTables,
  useSendErrors,
  useFetchData,
  useRetransmit,
} from '../hooks/useIFClient'

// 자동 갱신 포함 (autoRefresh: true 시 5초 폴링)
const { data: status, isLoading } = useClientStatus(autoRefresh)
const { data: sendSummary } = useSendSummary(autoRefresh)
const { data: fetchSummary } = useFetchSummary(autoRefresh)

// 테이블 목록 (staleTime: Infinity, 앱 기동 시 1회 호출)
const { data: tables } = useSendTables()
const { data: tables } = useFetchTables()

// 조건부 조회 (enabled가 true일 때만 호출)
const { data: rows, isLoading } = useSendErrors(tableName, enabled)
const { data: rows, isLoading } = useFetchData(tableName, from, to, enabled)

// Mutation (재전송)
const retransmit = useRetransmit()
retransmit.mutate({ tableNames: ['TABLE_A'] })
retransmit.mutate({ ids: ['id1', 'id2'] })
```

#### 주의사항
- `QueryClient` 기본 설정: `staleTime: Infinity`, `refetchOnWindowFocus: false`, `refetchOnMount: false`
- **자동 갱신은 `autoRefresh` prop으로만 제어** — 훅에 `true`를 전달해야 폴링 시작
- `placeholderData: (prev) => prev` 설정으로 갱신 시 이전 데이터를 유지 (로딩 깜빡임 방지)

---

## 신규 페이지 작성 절차

### 1. 타입 정의 (`src/types/index.ts`)
```ts
export interface MyData {
  id: string
  name: string
  // ...
}
```

### 2. API 함수 추가 (`src/api/ifClient.ts`)
```ts
// ifClientApi 객체 안에 추가
getMyData: (param: string) =>
  apiClient.get<MyData[]>('/my/endpoint', { params: { param } }).then((r) => r.data),
```

### 3. 훅 추가 (`src/hooks/useIFClient.ts`)
```ts
export const useMyData = (param: string, enabled: boolean) =>
  useQuery({
    queryKey: ['my', 'data', param],
    queryFn: () => ifClientApi.getMyData(param),
    enabled: enabled && !!param,
    placeholderData: (prev) => prev,   // 갱신 시 이전 데이터 유지
  })
```

### 4. 번역 키 추가 (`src/context/i18n.ts`)
```ts
const dict = {
  myPageTitle: { ko: '내 페이지', en: 'My Page' },
  myColumn:    { ko: '컬럼명',   en: 'Column' },
  // ...
}
```

### 5. 페이지 컴포넌트 생성 (`src/pages/MyPage.tsx`)
```tsx
import { useState } from 'react'
import { Card, Table } from 'antd'
import { useMyData } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'

// 그리드 높이 — 페이지 상단에 상수로 선언
const GRID_SCROLL_Y = 'calc(100vh - 192px)'

export default function MyPage() {
  const { t } = useAppContext()
  const [param, setParam] = useState('')
  const [enabled, setEnabled] = useState(false)

  const { data, isLoading } = useMyData(param, enabled)

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 검색 조건 */}
      <Card size="small"> ... </Card>

      {/* 그리드 */}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}>
        <Table
          dataSource={data ?? []}
          loading={isLoading}
          scroll={{ x: 'max-content', y: GRID_SCROLL_Y }}
          size="small"
          pagination={{ pageSize: 50, size: 'small' }}
        />
      </Card>
    </div>
  )
}
```

### 6. 라우트 등록 (`src/App.tsx`)
```tsx
import MyPage from './pages/MyPage'

// Routes 안에 추가
<Route path="my-page" element={<MyPage />} />
```

### 7. 사이드바 메뉴 추가 (`src/components/AppLayout.tsx`)
```tsx
import { FileOutlined } from '@ant-design/icons'

const menuItems = [
  { key: '/',        icon: <DashboardOutlined />, label: t('dashboard') },
  { key: '/send',    icon: <ArrowUpOutlined />,   label: t('send') },
  { key: '/fetch',   icon: <ArrowDownOutlined />, label: t('fetch') },
  { key: '/my-page', icon: <FileOutlined />,      label: t('myPage') }, // 추가
]
```

---

## 다국어(i18n) 추가

`src/context/i18n.ts`의 `dict` 객체에 키-값 쌍을 추가합니다.

```ts
const dict: Record<string, Record<Lang, string>> = {
  // 기존 키들 ...
  newKey: { ko: '한글 텍스트', en: 'English Text' },
}
```

컴포넌트에서는 `useAppContext()`의 `t()` 함수로 사용합니다.

```tsx
const { t } = useAppContext()
<Text>{t('newKey')}</Text>
```
