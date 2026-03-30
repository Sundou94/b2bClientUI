import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Popconfirm,
} from 'antd'
import { ReloadOutlined, SendOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  useClientStatus,
  useSendSummary,
  useFetchSummary,
  useRetransmit,
} from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { IFTableSummary } from '../types'

const { Text } = Typography

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const GRID_HEIGHT = 'calc(100vh - 280px)'

// 카드 내부 로딩 오버레이
function CardSpin({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Spin spinning={loading} size="default" style={{ maxHeight: '100%' }}>
      {children}
    </Spin>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useAppContext()
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastQueried, setLastQueried] = useState<Date | null>(null)
  const [selectedSendTable, setSelectedSendTable] = useState<string | null>(null)
  const [uptimeOffset, setUptimeOffset] = useState(0)

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useClientStatus(autoRefresh)
  const { data: sendSummary, isLoading: sendLoading, refetch: refetchSend } = useSendSummary(autoRefresh)
  const { data: fetchSummary, isLoading: fetchLoading, refetch: refetchFetch } = useFetchSummary(autoRefresh)
  const retransmit = useRetransmit()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!status) return
    setUptimeOffset(0)
    intervalRef.current = setInterval(() => setUptimeOffset((p) => p + 1), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [status?.startTime])

  useEffect(() => {
    if (sendSummary || fetchSummary) setLastQueried(new Date())
  }, [sendSummary, fetchSummary])

  const handleRefresh = () => {
    refetchStatus(); refetchSend(); refetchFetch()
    setLastQueried(new Date())
  }

  const summaryColumns = (direction: 'send' | 'fetch'): ColumnsType<IFTableSummary> => [
    {
      title: t('tableName'),
      dataIndex: 'tableName',
      render: (v) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
      ellipsis: true,
    },
    {
      title: t('lastSyncTime'),
      dataIndex: 'lastSyncTime',
      width: 130,
      render: (v) => (
        <Text style={{ fontSize: 11 }}>
          {v ? dayjs(v).format('MM-DD HH:mm:ss') : '-'}
        </Text>
      ),
    },
    {
      title: t('errorCount'),
      dataIndex: 'errorCount',
      width: 72,
      align: 'center',
      render: (v: number) =>
        v > 0 ? <Tag color="red" style={{ fontSize: 11 }}>{v}</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>0</Text>,
    },
    ...(direction === 'send'
      ? [{
          title: t('pendingCount'),
          dataIndex: 'pendingCount' as keyof IFTableSummary,
          width: 72,
          align: 'center' as const,
          render: (v: unknown) =>
            (v as number) > 0
              ? <Tag color="orange" style={{ fontSize: 11 }}>{v as number}</Tag>
              : <Text type="secondary" style={{ fontSize: 11 }}>0</Text>,
        }]
      : []),
  ]

  const currentUptime = (status?.uptimeSeconds ?? 0) + uptimeOffset

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ── 버튼 행 (최상단) ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>{t('refresh')}</Button>
        <Button
          type={autoRefresh ? 'primary' : 'default'}
          onClick={() => setAutoRefresh((p) => !p)}
        >
          {autoRefresh ? t('autoOn') : t('autoOff')}
        </Button>
        <Popconfirm
          title={selectedSendTable ? t('confirmRetransmit') : t('noTableSelected')}
          onConfirm={() => { if (selectedSendTable) retransmit.mutate({ tableNames: [selectedSendTable] }) }}
          disabled={!selectedSendTable}
        >
          <Button
            icon={<SendOutlined />}
            danger
            disabled={!selectedSendTable}
            loading={retransmit.isPending}
          >
            {t('retransmit')}{selectedSendTable ? ` (${selectedSendTable})` : ''}
          </Button>
        </Popconfirm>
      </div>

      {/* ── 상태 카드 ── */}
      <Row gutter={12} style={{ flexShrink: 0 }}>
        {[
          {
            title: t('clientStatus'),
            value: status?.status ?? '-',
            valueStyle: { color: status?.status === 'RUNNING' ? '#52c41a' : '#ff4d4f', fontSize: 18 },
            loading: statusLoading,
          },
          {
            title: t('startTime'),
            value: status ? dayjs(status.startTime).format('MM-DD HH:mm:ss') : '-',
            valueStyle: { fontSize: 16 },
            loading: statusLoading,
          },
          {
            title: t('uptime'),
            value: status ? formatUptime(currentUptime) : '--:--:--',
            valueStyle: { fontSize: 16, fontVariantNumeric: 'tabular-nums' },
            loading: statusLoading,
          },
          {
            title: t('totalErrors'),
            value: status?.totalErrorCount ?? 0,
            valueStyle: { color: (status?.totalErrorCount ?? 0) > 0 ? '#ff4d4f' : '#52c41a' },
            loading: statusLoading,
          },
        ].map((card, i) => (
          <Col span={6} key={i}>
            <Card
              size="small"
              style={{ height: 80 }}
              styles={{ body: { height: '100%', display: 'flex', alignItems: 'center' } }}
            >
              <CardSpin loading={card.loading}>
                <Statistic title={card.title} value={card.value} valueStyle={card.valueStyle} />
              </CardSpin>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── 좌우 그리드 ── */}
      <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
        {/* SEND */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}
            title={
              <Space>
                <Text strong>{t('ifStatusSend')}</Text>
                {lastQueried && (
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>
                    {t('lastQueried')}: {dayjs(lastQueried).format('HH:mm:ss')}
                  </Text>
                )}
              </Space>
            }
          >
            <Table<IFTableSummary>
              dataSource={sendSummary ?? []}
              columns={summaryColumns('send')}
              rowKey="tableName"
              loading={sendLoading}
              pagination={false}
              size="small"
              scroll={{ y: GRID_HEIGHT }}
              rowClassName={(r) => (r.hasError ? 'row-error' : '')}
              onRow={(r) => ({
                onClick: () => setSelectedSendTable(r.tableName === selectedSendTable ? null : r.tableName),
                onDoubleClick: () => navigate(`/send?table=${encodeURIComponent(r.tableName)}`),
                style: {
                  cursor: 'pointer',
                  background: r.tableName === selectedSendTable ? '#e6f4ff' : undefined,
                },
              })}
            />
          </Card>
        </Col>

        {/* FETCH */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}
            title={
              <Space>
                <Text strong>{t('ifStatusFetch')}</Text>
                {lastQueried && (
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>
                    {t('lastQueried')}: {dayjs(lastQueried).format('HH:mm:ss')}
                  </Text>
                )}
              </Space>
            }
          >
            <Table<IFTableSummary>
              dataSource={fetchSummary ?? []}
              columns={summaryColumns('fetch')}
              rowKey="tableName"
              loading={fetchLoading}
              pagination={false}
              size="small"
              scroll={{ y: GRID_HEIGHT }}
              rowClassName={(r) => (r.hasError ? 'row-error' : '')}
              onRow={(r) => ({
                onDoubleClick: () => navigate(`/fetch?table=${encodeURIComponent(r.tableName)}`),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
