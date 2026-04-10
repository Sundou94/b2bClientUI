import { Card, Col, Row, Table, Typography, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useJobEventSSE } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { SseSummaryRow } from '../types'

const { Text } = Typography

const hCenter = { onHeaderCell: () => ({ style: { textAlign: 'center' as const } }) }

const buildColumns = (): ColumnsType<SseSummaryRow> => [
  {
    title: 'Table',
    dataIndex: 'tableName',
    align: 'left',
    ...hCenter,
    render: (v) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    ellipsis: true,
  },
  {
    title: '최종 Job 시간',
    dataIndex: 'lastJobTime',
    width: 140,
    align: 'center',
    ...hCenter,
    render: (v) => (
      <Text style={{ fontSize: 11 }}>{v ? dayjs(v).format('MM-DD HH:mm:ss') : '-'}</Text>
    ),
  },
  {
    title: '성공 건수',
    dataIndex: 'successCount',
    width: 90,
    align: 'right',
    ...hCenter,
    render: (v: number) => (
      <Text strong style={{ fontSize: 12, color: '#52c41a' }}>{v.toLocaleString()}</Text>
    ),
  },
]

export default function IfSummary() {
  const { t } = useAppContext()
  const { sendRows, fetchRows, connected } = useJobEventSSE()

  const columns = buildColumns()

  const gridCard = (title: string, rows: SseSummaryRow[]) => (
    <Card
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text strong>{title}</Text>
          <Badge
            status={connected ? 'processing' : 'error'}
            text={
              <Text type="secondary" style={{ fontSize: 11 }}>
                {connected ? 'SSE 연결됨' : 'SSE 끊김'}
              </Text>
            }
          />
        </span>
      }
    >
      <Table<SseSummaryRow>
        dataSource={rows}
        columns={columns}
        rowKey="tableName"
        pagination={false}
        size="small"
        scroll={{ y: 'calc(100vh - 180px)' }}
      />
    </Card>
  )

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
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
