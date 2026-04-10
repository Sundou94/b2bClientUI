import apiClient from './client'
import type { ClientStatus, LotHisIfRow, RetransmitRequest, RetransmitResult } from '../types'

export const ifClientApi = {
  getClientStatus: () =>
    apiClient.get<ClientStatus>('/client/status').then((r) => r.data),

  getLotHisIf: (from: string, to: string) =>
    apiClient.get<LotHisIfRow[]>('/lot-his-if/list', { params: { from, to } }).then((r) => r.data),

  retransmit: (req: RetransmitRequest) =>
    apiClient.post<RetransmitResult>('/send/retransmit', req).then((r) => r.data),
}
