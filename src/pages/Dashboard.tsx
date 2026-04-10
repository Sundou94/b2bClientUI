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

const colDefs: ColDef<LotHisIfRow>[] = [
  {
    headerName: 'LOT ID',
    field: 'lotId',
    flex: 1,
    cellRenderer: ({ value }: { value: string }) => (
      <strong style={{ fontSize: 12 }}>{value}</strong>
    ),
  },
  {
    headerName: '상태',
    field: 'status',
    width: 100,
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cellRenderer: ({ value }: { value: LotHisIfRow['status'] }) => {
      const colorMap = { SUCCESS: 'green', ERROR: 'red', PENDING: 'orange' } as const
      return <Tag color={colorMap[value]} style={{ fontSize: 11, margin: 0 }}>{value}</Tag>
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
    cellStyle: { color: '#ff4d4f', fontSize: 11 },
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
  const retransmit = useRetransmit()

  useEffect(() => {
    if (!lotData) return
    setLastQueried(new Date())
  }, [lotData])

  const displayStatus = statusError ? 'STOP' : (status?.status ?? 'STOP')

  const statusCards = [
    {
      title: t('clientStatus'),
      value: displayStatus,
      valueStyle: { color: displayStatus === 'RUNNING' ? '#52c41a' : '#ff4d4f', fontSize: 18 },
    },
    {
      title: t('startTime'),
      value: status ? dayjs(status.startTime).format('MM-DD HH:mm:ss') : '-',
      valueStyle: { fontSize: 16 },
    },
    {
      title: t('totalErrors'),
      value: status?.totalErrorCount ?? 0,
      valueStyle: { color: (status?.totalErrorCount ?? 0) > 0 ? '#ff4d4f' : '#52c41a' },
    },
  ]

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
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

      <Row gutter={12} style={{ flexShrink: 0 }}>
        {statusCards.map((card, i) => (
          <Col span={8} key={i}>
            <Card size="small" style={{ height: 80 }} styles={{ body: { height: '100%', display: 'flex', alignItems: 'center' } }}>
              <CardSpin loading={statusLoading}>
                <Statistic title={card.title} value={card.value} valueStyle={card.valueStyle} />
              </CardSpin>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, padding: '8px 0 0', overflow: 'hidden' } }}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>b2b_mes_lot_his_if 현황</Text>
            {lastQueried && (
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>
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
            checkboxes: true,            // 모든 row에 체크박스 표시
            isRowSelectable: (p) => p.data?.status === 'ERROR',  // ERROR만 선택 가능
            enableClickSelection: false,
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
          rowClassRules={{ 'row-error': (p) => p.data?.status === 'ERROR' }}
          pagination
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100]}
        />
      </Card>
    </div>
  )
}
