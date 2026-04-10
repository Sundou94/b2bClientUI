export type ClientStatusType = 'RUNNING' | 'STOPPED' | 'ERROR'

export interface ClientStatus {
  status: ClientStatusType
  startTime: string
  uptimeSeconds: number
  totalErrorCount: number
}

export interface LotHisIfRow {
  id: string
  lotId: string
  status: 'SUCCESS' | 'ERROR' | 'PENDING'
  errorMessage: string | null
  processedAt: string | null
  createdAt: string
}

export interface RetransmitRequest {
  tableNames?: string[]
  ids?: string[]
}

export interface RetransmitResult {
  successCount: number
  failCount: number
  message: string
}

export interface JobEndEvent {
  direction: 'SEND' | 'FETCH'
  tableName: string
  count: number
  timestamp: string
}

export interface SseSummaryRow {
  tableName: string
  lastJobTime: string
  successCount: number
}
