import { useState, useEffect } from 'react'
import {
  Card, Col, Row, Statistic, Button,
  Tag, Typography, Spin, Popconfirm,
} from 'antd'
import { ReloadOutlined, SendOutlined } from '@ant-design/icons'
import type { ColDef, GridApi, SelectionChangedEvent } from 'ag-grid-community'
import dayjs from 'dayjs'
import { useClientStatus, useLotHisIf, useRetransmit } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import AppGrid from '../components/AppGrid'
import type { LotHisIfRow } from '../types'

const { Text } = Typography

function CardSpin({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Spin spinning={loading} size="default" style={{ maxHeight: '100%' }}>
      {children}
    </Spin>
  )
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const colDefs: ColDef<LotHisIfRow>[] = [
  {
    headerName: 'LOT ID',
    field: 'lotId',
    flex: 1,
    cellRenderer: ({ value }: { value: string }) => <strong>{value}</strong>,
  },
  {
    headerName: '상태',
    field: 'status',
    width: 100,
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cellRenderer: ({ value }: { value: LotHisIfRow['status'] }) => {
      const colorMap = { SUCCESS: 'green', ERROR: 'red', PENDING: 'orange' } as const
      return <Tag color={colorMap[value]} style={{ margin: 0 }}>{value}</Tag>
    },
  },
  {
    headerName: '처리일시',
    field: 'processedAt',
    width: 150,
    cellStyle: { textAlign: 'center' },
    valueFormatter: ({ value }) => value ? dayjs(value).format('MM-DD HH:mm:ss') : '-',
  },
  {
    headerName: '등록일시',
    field: 'createdAt',
    width: 150,
    cellStyle: { textAlign: 'center' },
    valueFormatter: ({ value }) => value ? dayjs(value).format('MM-DD HH:mm:ss') : '-',
  },
  {
    headerName: '오류메시지',
    field: 'errorMessage',
    flex: 2,
    cellStyle: { color: 'var(--color-error)' },
    valueFormatter: ({ value }) => value ?? '-',
  },
]

export default function Dashboard() {
  const { t } = useAppContext()
  const [gridApi, setGridApi] = useState<GridApi<LotHisIfRow> | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastQueried, setLastQueried] = useState<Date | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data: status, isLoading: statusLoading, isError: statusError, refetch: refetchStatus } = useClientStatus(autoRefresh)
  const { data: lotData, isLoading: lotLoading, refetch: refetchLot } = useLotHisIf(autoRefresh)
  const retransmit = useRetransmit(() => {
    setSelectedIds([])
    gridApi?.deselectAll()
  })

  useEffect(() => {
    if (!lotData) return
    setLastQueried(new Date())
  }, [lotData])

  const displayStatus = statusError ? 'STOP' : (status?.status ?? 'STOP')

  const statusCards = [
    {
      title: t('clientStatus'),
      value: displayStatus,
      valueStyle: { color: displayStatus === 'RUNNING' ? 'var(--color-success)' : 'var(--color-error)', fontSize: 'var(--font-lg)' },
    },
    {
      title: t('startTime'),
      value: status ? dayjs(status.startTime).format('MM-DD HH:mm:ss') : '-',
      valueStyle: { fontSize: 'var(--font-lg)' },
    },
    {
      title: t('uptime'),
      value: status ? formatUptime(status.uptimeSeconds) : '-',
      valueStyle: { fontSize: 'var(--font-lg)' },
    },
    {
      title: t('totalErrors'),
      value: status?.totalErrorCount ?? 0,
      valueStyle: { color: (status?.totalErrorCount ?? 0) > 0 ? 'var(--color-error)' : 'var(--color-success)' },
    },
  ]

  return (
    <div className="page">
      <div className="page-toolbar">
        <Button icon={<ReloadOutlined />} onClick={() => { refetchStatus(); refetchLot(); setLastQueried(new Date()) }}>
          {t('refresh')}
        </Button>
        <Button type={autoRefresh ? 'primary' : 'default'} onClick={() => setAutoRefresh((p) => !p)}>
          {autoRefresh ? t('autoOn') : t('autoOff')}
        </Button>
        <Popconfirm
          title={`선택한 ${selectedIds.length}건을 재전송하시겠습니까?`}
          onConfirm={() => retransmit.mutate({ ids: selectedIds })}
          disabled={selectedIds.length === 0}
          okText="확인"
          cancelText="취소"
        >
          <Button icon={<SendOutlined />} danger disabled={selectedIds.length === 0} loading={retransmit.isPending}>
            {t('retransmit')}{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </Button>
        </Popconfirm>
      </div>

      <Row gutter={[16, 0]} className="status-card-row">
        {statusCards.map((card, i) => (
          <Col span={6} key={i}>
            <Card size="small" className="status-card">
              <CardSpin loading={statusLoading}>
                <Statistic title={card.title} value={card.value} valueStyle={card.valueStyle} />
              </CardSpin>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="grid-card"
        title={
          <span className="grid-card-title">
            <Text strong>b2b_mes_lot_his_if 현황</Text>
            {lastQueried && (
              <Text type="secondary" className="grid-card-subtitle">
                {t('lastQueried')}: {dayjs(lastQueried).format('HH:mm:ss')}
              </Text>
            )}
          </span>
        }
      >
        <AppGrid<LotHisIfRow>
          rowData={lotData ?? []}
          columnDefs={colDefs}
          loading={lotLoading}
          onGridReady={(e) => setGridApi(e.api)}
          rowSelection={{
            mode: 'multiRow',
            checkboxes: true,
            isRowSelectable: (p) => p.data?.status === 'ERROR',
            // 행 클릭으로 선택 (ERROR row만 선택 가능)
            enableClickSelection: 'enableDeselection',
          }}
          getRowId={(p) => p.data.id}
          onSelectionChanged={(e: SelectionChangedEvent<LotHisIfRow>) => {
            setSelectedIds(e.api.getSelectedRows().map((r) => r.id))
          }}
          // 데이터 갱신 후 ERROR가 아닌 row는 선택 해제
          onRowDataUpdated={() => {
            gridApi?.forEachNode((node) => {
              if (node.isSelected() && node.data?.status !== 'ERROR') node.setSelected(false)
            })
          }}
          pagination
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100]}
        />
      </Card>
    </div>
  )
}
