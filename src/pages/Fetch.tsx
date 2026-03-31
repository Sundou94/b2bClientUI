import { useState, useEffect } from 'react'
import { Card, Table, Button, Select, Space, Typography, DatePicker } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useSearchParams } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import { useFetchTables, useFetchData } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { FetchRow } from '../types'

const { Text } = Typography
const { RangePicker } = DatePicker

// 높이: 전체 - 패딩(48) - 검색바 카드(56) - gap(16) - 그리드 카드 헤더(56) - 여유(16)
const GRID_SCROLL_Y = 'calc(100vh - 192px)'

function buildDynamicColumns(rows: FetchRow[]): ColumnsType<FetchRow> {
  if (!rows.length) return []
  return Object.keys(rows[0].data).map((key) => ({
    title: key,
    key: `data_${key}`,
    ellipsis: true,
    render: (_: unknown, r: FetchRow) => String(r.data[key] ?? ''),
  }))
}

const DEFAULT_RANGE: [Dayjs, Dayjs] = [dayjs().startOf('day'), dayjs().endOf('day')]

export default function Fetch() {
  const [searchParams] = useSearchParams()
  const { t } = useAppContext()
  const [selectedTable, setSelectedTable] = useState<string>(searchParams.get('table') ?? '')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(DEFAULT_RANGE)
  const [searched, setSearched] = useState(!!searchParams.get('table'))

  const { data: tables } = useFetchTables()
  const { data: rows, isLoading } = useFetchData(
    selectedTable,
    dateRange[0].toISOString(),
    dateRange[1].toISOString(),
    searched,
  )

  useEffect(() => {
    const tbl = searchParams.get('table')
    if (tbl) { setSelectedTable(tbl); setSearched(true) }
  }, [searchParams])

  const handleSearch = () => { if (selectedTable) setSearched(true) }

  const fixedColumns: ColumnsType<FetchRow> = [
    {
      title: t('receivedAt'),
      dataIndex: 'receivedAt',
      width: 160,
      fixed: 'right',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

  const allColumns: ColumnsType<FetchRow> = [...buildDynamicColumns(rows ?? []), ...fixedColumns]

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── 검색 조건 (Table + 날짜 + 검색 + 데이터 건수) ── */}
      <Card size="small" styles={{ body: { padding: '10px 16px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select
            placeholder={t('selectTable')}
            value={selectedTable || undefined}
            onChange={setSelectedTable}
            options={(tables ?? []).map((tbl) => ({ label: tbl.tableName, value: tbl.tableName }))}
            style={{ width: 200 }}
            showSearch
            allowClear
          />
          <RangePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            value={dateRange}
            onChange={(v) => { if (v && v[0] && v[1]) setDateRange([v[0], v[1]]) }}
            allowClear={false}
            size="middle"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={!selectedTable}
          >
            {t('search')}
          </Button>

          {/* 데이터 건수 */}
          {searched && (
            <Space style={{ marginLeft: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>{t('dataCount')}:</Text>
              <Text strong style={{ fontSize: 14 }}>
                {(rows?.length ?? 0).toLocaleString()}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>건</Text>
            </Space>
          )}
        </div>
      </Card>

      {/* ── 그리드 ── */}
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}
        title={<Text strong>{t('receivedData')}</Text>}
      >
        <Table<FetchRow>
          dataSource={rows ?? []}
          columns={allColumns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 50, showSizeChanger: false, size: 'small' }}
          size="small"
          scroll={{ x: 'max-content', y: GRID_SCROLL_Y }}
          locale={{ emptyText: searched ? t('noData') : t('selectAndSearch') }}
        />
      </Card>
    </div>
  )
}
