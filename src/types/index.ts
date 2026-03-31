export type ClientStatusType = 'RUNNING' | 'STOPPED' | 'ERROR'

export interface ClientStatus {
  status: ClientStatusType
  startTime: string        // ISO 8601
  uptimeSeconds: number
  totalErrorCount: number
}

export interface IFTableItem {
  fieldName: string
  tableName: string
  type: string
  enabled: boolean
}

export interface IFTableSummary {
  tableName: string
  lastSyncTime: string | null
  errorCount: number
  pendingCount: number
  hasError: boolean
}

export interface SendRow {
  id: string
  tableName: string
  errorFlag: string
  errorMessage: string | null
  status: 'PENDING' | 'ERROR'
  createdAt: string
  data: Record<string, unknown>
}

export interface FetchRow {
  id: string
  tableName: string
  receivedAt: string
  data: Record<string, unknown>
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
