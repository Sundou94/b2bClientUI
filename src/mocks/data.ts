import type { ClientStatus, LotHisIfRow } from '../types'

export const mockClientStatus: ClientStatus = {
  status: 'RUNNING',
  startTime: new Date(Date.now() - 3 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(), // 3h 25m ago
  uptimeSeconds: 3 * 3600 + 25 * 60,
  totalErrorCount: 3,
}

export const mockLotHisIfRows: LotHisIfRow[] = [
  {
    id: '1',
    lotId: 'LOT-20240410-001',
    status: 'ERROR',
    errorMessage: 'Connection timeout: MES 서버 응답 없음',
    processedAt: null,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    lotId: 'LOT-20240410-002',
    status: 'ERROR',
    errorMessage: 'Duplicate key violation: PK_B2B_LOT_HIS',
    processedAt: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    lotId: 'LOT-20240410-003',
    status: 'ERROR',
    errorMessage: 'Invalid data format: LOT_QTY must be numeric',
    processedAt: null,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    lotId: 'LOT-20240410-004',
    status: 'SUCCESS',
    errorMessage: null,
    processedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    lotId: 'LOT-20240410-005',
    status: 'SUCCESS',
    errorMessage: null,
    processedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    lotId: 'LOT-20240409-021',
    status: 'PENDING',
    errorMessage: null,
    processedAt: null,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
]
