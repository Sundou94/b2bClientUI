import apiClient from './client'
import type { ClientStatus, LotHisIfRow, RetransmitRequest, RetransmitResult } from '../types'

export const ifClientApi = {
  getClientStatus: () =>
    apiClient.get<ClientStatus>('/client/status').then((r) => r.data),

  getLotHisIf: () =>
    apiClient.get<LotHisIfRow[]>('/lot-his-if/errors').then((r) => r.data),

  retransmit: (req: RetransmitRequest) =>
    apiClient.post<RetransmitResult>('/send/retransmit', req).then((r) => r.data),
}
