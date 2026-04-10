import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { ifClientApi } from '../api/ifClient'
import type { JobEndEvent, RetransmitRequest, SseSummaryRow } from '../types'

export const useClientStatus = (autoRefresh: boolean, intervalMs = 5000) =>
  useQuery({
    queryKey: ['client', 'status'],
    queryFn: ifClientApi.getClientStatus,
    refetchInterval: autoRefresh ? intervalMs : false,
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
      queryClient.invalidateQueries({ queryKey: ['lot-his-if'] })
      queryClient.invalidateQueries({ queryKey: ['client'] })
    },
    onError: () => message.error('재전송 요청에 실패했습니다.'),
  })
}

// SSE — Job End 이벤트 수신
export function useJobEventSSE(sseUrl = '/api/sse/job-events') {
  const [sendMap, setSendMap] = useState<Record<string, SseSummaryRow>>({})
  const [fetchMap, setFetchMap] = useState<Record<string, SseSummaryRow>>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource(sseUrl)

    es.onopen = () => setConnected(true)

    const handleEvent = (e: MessageEvent) => {
      let event: JobEndEvent
      try {
        event = JSON.parse(e.data)
      } catch {
        return
      }

      const row: SseSummaryRow = {
        tableName: event.tableName,
        lastJobTime: event.timestamp,
        successCount: event.count,
      }

      if (event.direction === 'SEND') {
        setSendMap((prev) => ({ ...prev, [event.tableName]: row }))
      } else {
        setFetchMap((prev) => ({ ...prev, [event.tableName]: row }))
      }
    }

    es.addEventListener('job-end', handleEvent)
    es.onmessage = handleEvent  // 이벤트 타입 미지정 시 fallback

    es.onerror = () => {
      setConnected(false)
      es.close()
    }

    return () => {
      es.close()
      setConnected(false)
    }
  }, [sseUrl])

  return {
    sendRows: Object.values(sendMap),
    fetchRows: Object.values(fetchMap),
    connected,
  }
}
