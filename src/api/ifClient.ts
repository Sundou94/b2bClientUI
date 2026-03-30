import apiClient from './client'
import type {
  ClientStatus,
  IFTableSummary,
  SendRow,
  FetchRow,
  RetransmitRequest,
  RetransmitResult,
} from '../types'

export const ifClientApi = {
  // ── Client 상태 ──────────────────────────────
  getClientStatus: () =>
    apiClient.get<ClientStatus>('/client/status').then((r) => r.data),

  // ── SEND ─────────────────────────────────────
  getSendSummary: () =>
    apiClient.get<IFTableSummary[]>('/send/summary').then((r) => r.data),

  getSendTables: () =>
    apiClient.get<string[]>('/send/tables').then((r) => r.data),

  getSendErrors: (tableName: string) =>
    apiClient
      .get<SendRow[]>('/send/errors', { params: { tableName } })
      .then((r) => r.data),

  retransmit: (req: RetransmitRequest) =>
    apiClient.post<RetransmitResult>('/send/retransmit', req).then((r) => r.data),

  // ── FETCH ─────────────────────────────────────
  getFetchSummary: () =>
    apiClient.get<IFTableSummary[]>('/fetch/summary').then((r) => r.data),

  getFetchTables: () =>
    apiClient.get<string[]>('/fetch/tables').then((r) => r.data),

  getFetchData: (tableName: string, from: string, to: string) =>
    apiClient
      .get<FetchRow[]>('/fetch/data', { params: { tableName, from, to } })
      .then((r) => r.data),
}
