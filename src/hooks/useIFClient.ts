import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { ifClientApi } from '../api/ifClient'
import type { RetransmitRequest } from '../types'

export const useClientStatus = (autoRefresh: boolean, intervalMs = 5000) =>
  useQuery({
    queryKey: ['client', 'status'],
    queryFn: ifClientApi.getClientStatus,
    refetchInterval: autoRefresh ? intervalMs : false,
    // 최초 로드 이후에는 이전 데이터 유지 (로딩 스피너 방지)
    placeholderData: (prev) => prev,
  })

export const useSendSummary = (autoRefresh: boolean, intervalMs = 5000) =>
  useQuery({
    queryKey: ['send', 'summary'],
    queryFn: ifClientApi.getSendSummary,
    refetchInterval: autoRefresh ? intervalMs : false,
    placeholderData: (prev) => prev,
  })

export const useFetchSummary = (autoRefresh: boolean, intervalMs = 5000) =>
  useQuery({
    queryKey: ['fetch', 'summary'],
    queryFn: ifClientApi.getFetchSummary,
    refetchInterval: autoRefresh ? intervalMs : false,
    placeholderData: (prev) => prev,
  })

export const useSendTables = () =>
  useQuery({
    queryKey: ['send', 'tables'],
    queryFn: ifClientApi.getSendTables,
    staleTime: 60_000,
  })

export const useFetchTables = () =>
  useQuery({
    queryKey: ['fetch', 'tables'],
    queryFn: ifClientApi.getFetchTables,
    staleTime: 60_000,
  })

export const useSendErrors = (tableName: string, enabled: boolean) =>
  useQuery({
    queryKey: ['send', 'errors', tableName],
    queryFn: () => ifClientApi.getSendErrors(tableName),
    enabled: enabled && !!tableName,
    placeholderData: (prev) => prev,
  })

export const useFetchData = (
  tableName: string,
  from: string,
  to: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ['fetch', 'data', tableName, from, to],
    queryFn: () => ifClientApi.getFetchData(tableName, from, to),
    enabled: enabled && !!tableName,
    placeholderData: (prev) => prev,
  })

export const useLotHisIf = (from: string, to: string, autoRefresh: boolean, intervalMs = 5000) =>
  useQuery({
    queryKey: ['lot-his-if', from, to],
    queryFn: () => ifClientApi.getLotHisIf(from, to),
    enabled: !!from && !!to,
    refetchInterval: autoRefresh ? intervalMs : false,
    placeholderData: (prev) => prev,
  })

export const useRetransmit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: RetransmitRequest) => ifClientApi.retransmit(req),
    onSuccess: (result) => {
      message.success(
        `재전송 완료 — 성공: ${result.successCount}건 / 실패: ${result.failCount}건`,
      )
      queryClient.invalidateQueries({ queryKey: ['send'] })
      queryClient.invalidateQueries({ queryKey: ['client'] })
    },
    onError: () => message.error('재전송 요청에 실패했습니다.'),
  })
}
