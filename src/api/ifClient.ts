import apiClient from './client'
import type {
  ClientStatus,
  LotHisIfRow,
  RetransmitRequest,
  RetransmitResult,
} from '../types'

export const ifClientApi = {
  // ── Client 상태 ──────────────────────────────
  getClientStatus: () =>
    apiClient.get<ClientStatus>('/client/status').then((r) => r.data),

  // ── LOT HIS IF ───────────────────────────────
  getLotHisIf: (from: string, to: string) =>
    apiClient
      .get<LotHisIfRow[]>('/lot-his-if/list', { params: { from, to } })
      .then((r) => r.data),

  // ── 재전송 ───────────────────────────────────
  retransmit: (req: RetransmitRequest) =>
    apiClient.post<RetransmitResult>('/send/retransmit', req).then((r) => r.data),
}
