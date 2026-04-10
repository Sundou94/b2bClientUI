import { Card, Col, Row, Typography, Badge } from 'antd'
import type { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'
import { useJobEventSSE } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import AppGrid from '../components/AppGrid'
import type { SseSummaryRow } from '../types'

const { Text } = Typography

const colDefs: ColDef<SseSummaryRow>[] = [
  {
    headerName: 'Table',
    field: 'tableName',
    flex: 1,
    cellRenderer: ({ value }: { value: string }) => <strong>{value}</strong>,
  },
  {
    headerName: '최종 Job 시간',
    field: 'lastJobTime',
    width: 150,
    cellStyle: { textAlign: 'center' },
    valueFormatter: ({ value }) => value ? dayjs(value).format('MM-DD HH:mm:ss') : '-',
  },
  {
    headerName: '성공 건수',
    field: 'successCount',
    width: 110,
    cellStyle: { textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 },
    valueFormatter: ({ value }) => (value as number).toLocaleString(),
  },
]

export default function IfSummary() {
  const { t } = useAppContext()
  const { sendRows, fetchRows, connected } = useJobEventSSE()

  const sseStatus = (
    <Badge
      status={connected ? 'processing' : 'error'}
      text={
        <Text type="secondary" className="grid-card-subtitle">
          {connected ? 'SSE 연결됨' : 'SSE 끊김'}
        </Text>
      }
    />
  )

  const gridCard = (title: string, rows: SseSummaryRow[]) => (
    <Card
      className="grid-card"
      title={
        <span className="grid-card-title">
          <Text strong>{title}</Text>
          {sseStatus}
        </span>
      }
    >
      <AppGrid<SseSummaryRow> rowData={rows} columnDefs={colDefs} />
    </Card>
  )

  return (
    <div className="page">
      <Row gutter={[16, 0]} style={{ flex: 1, minHeight: 0 }}>
        <Col span={12} style={{ height: '100%' }}>
          {gridCard(t('ifStatusSend'), sendRows)}
        </Col>
        <Col span={12} style={{ height: '100%' }}>
          {gridCard(t('ifStatusFetch'), fetchRows)}
        </Col>
      </Row>
    </div>
  )
}
