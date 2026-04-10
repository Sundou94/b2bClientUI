import { useState, useEffect } from 'react'
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
  DatePicker,
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import {
  useClientStatus,
  useLotHisIf,
} from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { LotHisIfRow } from '../types'

const { Text } = Typography
const { RangePicker } = DatePicker

// 카드 내부 로딩 오버레이
function CardSpin({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Spin spinning={loading} size="default" style={{ maxHeight: '100%' }}>
      {children}
    </Spin>
  )
}

const lotHisIfColumns: ColumnsType<LotHisIfRow> = [
  {
    title: 'LOT ID',
    dataIndex: 'lotId',
    width: 160,
    render: (v) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    ellipsis: true,
  },
  {
    title: '상태',
    dataIndex: 'status',
    width: 90,
    align: 'center',
    render: (v: LotHisIfRow['status']) => {
      const colorMap = { SUCCESS: 'green', ERROR: 'red', PENDING: 'orange' } as const
      return <Tag color={colorMap[v]} style={{ fontSize: 11 }}>{v}</Tag>
    },
  },
  {
    title: '처리일시',
    dataIndex: 'processedAt',
    width: 140,
    render: (v) => (
      <Text style={{ fontSize: 11 }}>{v ? dayjs(v).format('MM-DD HH:mm:ss') : '-'}</Text>
    ),
  },
  {
    title: '등록일시',
    dataIndex: 'createdAt',
    width: 140,
    render: (v) => (
      <Text style={{ fontSize: 11 }}>{v ? dayjs(v).format('MM-DD HH:mm:ss') : '-'}</Text>
    ),
  },
  {
    title: '오류메시지',
    dataIndex: 'errorMessage',
    render: (v) => (
      <Text type="danger" style={{ fontSize: 11 }}>{v ?? '-'}</Text>
    ),
    ellipsis: true,
  },
]

export default function Dashboard() {
  const { t } = useAppContext()
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastQueried, setLastQueried] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])

  const from = dateRange[0].toISOString()
  const to = dateRange[1].toISOString()

  const { data: status, isLoading: statusLoading, isError: statusError, refetch: refetchStatus } = useClientStatus(autoRefresh)
  const { data: lotData, isLoading: lotLoading, refetch: refetchLot } = useLotHisIf(from, to, autoRefresh)

  useEffect(() => {
    if (lotData) setLastQueried(new Date())
  }, [lotData])

  const handleRefresh = () => {
    refetchStatus()
    refetchLot()
    setLastQueried(new Date())
  }

  const displayStatus = statusError ? 'STOP' : (status?.status ?? 'STOP')

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ── 버튼 행 ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>{t('refresh')}</Button>
        <Button
          type={autoRefresh ? 'primary' : 'default'}
          onClick={() => setAutoRefresh((p) => !p)}
        >
          {autoRefresh ? t('autoOn') : t('autoOff')}
        </Button>
      </div>

      {/* ── 상태 카드 ── */}
      <Row gutter={12} style={{ flexShrink: 0 }}>
        {[
          {
            title: t('clientStatus'),
            value: displayStatus,
            valueStyle: { color: displayStatus === 'RUNNING' ? '#52c41a' : '#ff4d4f', fontSize: 18 },
            loading: statusLoading,
          },
          {
            title: t('startTime'),
            value: status ? dayjs(status.startTime).format('MM-DD HH:mm:ss') : '-',
            valueStyle: { fontSize: 16 },
            loading: statusLoading,
          },
          {
            title: t('totalErrors'),
            value: status?.totalErrorCount ?? 0,
            valueStyle: { color: (status?.totalErrorCount ?? 0) > 0 ? '#ff4d4f' : '#52c41a' },
            loading: statusLoading,
          },
        ].map((card, i) => (
          <Col span={8} key={i}>
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

      {/* ── b2b_mes_lot_his_if 현황 그리드 ── */}
      <Card
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
        title={
          <Space>
            <Text strong>b2b_mes_lot_his_if 현황</Text>
            {lastQueried && (
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>
                {t('lastQueried')}: {dayjs(lastQueried).format('HH:mm:ss')}
              </Text>
            )}
          </Space>
        }
        extra={
          <RangePicker
            showTime
            size="small"
            value={dateRange}
            onChange={(v) => { if (v?.[0] && v?.[1]) setDateRange([v[0], v[1]]) }}
            format="MM-DD HH:mm"
          />
        }
      >
        <Table<LotHisIfRow>
          dataSource={lotData ?? []}
          columns={lotHisIfColumns}
          rowKey="id"
          loading={lotLoading}
          pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (t) => `총 ${t}건` }}
          size="small"
          scroll={{ y: 'calc(100vh - 360px)' }}
          rowClassName={(r) => (r.status === 'ERROR' ? 'row-error' : '')}
        />
      </Card>
    </div>
  )
}
