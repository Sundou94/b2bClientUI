import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Tag,
  Typography,
  Modal,
  Dropdown,
  Divider,
} from 'antd'
import { SearchOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useSendTables, useSendErrors, useRetransmit } from '../hooks/useIFClient'
import { useAppContext } from '../context/AppContext'
import type { SendRow } from '../types'

const { Text } = Typography

// 높이: 전체 - 패딩(48) - 검색바 카드(56) - gap(16) - 그리드 카드 헤더(56) - 그리드 카드 하단패딩(16) - 여유(16)
const GRID_SCROLL_Y = 'calc(100vh - 208px)'

function buildDynamicColumns(rows: SendRow[]): ColumnsType<SendRow> {
  if (!rows.length) return []
  return Object.keys(rows[0].data).map((key) => ({
    title: key,
    key: `data_${key}`,
    ellipsis: true,
    render: (_: unknown, r: SendRow) => String(r.data[key] ?? ''),
  }))
}

const AUTO_INTERVAL_OPTIONS = [
  { label: '10초', value: 10 },
  { label: '30초', value: 30 },
  { label: '60초', value: 60 },
]

export default function Send() {
  const [searchParams] = useSearchParams()
  const { t } = useAppContext()
  const [selectedTable, setSelectedTable] = useState<string>(searchParams.get('table') ?? '')
  const [searched, setSearched] = useState(!!searchParams.get('table'))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [errorModalContent, setErrorModalContent] = useState<string | null>(null)
  const [autoRetransmit, setAutoRetransmit] = useState(false)
  const [autoInterval, setAutoInterval] = useState(30)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: tables } = useSendTables()
  const { data: rows, isLoading } = useSendErrors(selectedTable, searched)
  const retransmit = useRetransmit()

  useEffect(() => {
    const t = searchParams.get('table')
    if (t) { setSelectedTable(t); setSearched(true) }
  }, [searchParams])

  const doAutoRetransmit = useCallback(() => {
    if (!selectedTable) return
    retransmit.mutate({ tableNames: [selectedTable] })
  }, [selectedTable, retransmit])

  useEffect(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    if (autoRetransmit && selectedTable) {
      autoTimerRef.current = setInterval(doAutoRetransmit, autoInterval * 1000)
    }
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current) }
  }, [autoRetransmit, autoInterval, selectedTable, doAutoRetransmit])

  const handleSearch = () => { if (selectedTable) setSearched(true) }

  const handleManualRetransmit = () => {
    const ids = selectedIds.length > 0 ? selectedIds : undefined
    const tableNames = selectedIds.length === 0 ? [selectedTable] : undefined
    retransmit.mutate({ ids, tableNames })
    setSelectedIds([])
  }

  const errorCount = rows?.filter((r) => r.status === 'ERROR').length ?? 0
  const pendingCount = rows?.filter((r) => r.status === 'PENDING').length ?? 0

  const fixedColumns: ColumnsType<SendRow> = [
    {
      title: t('status'),
      dataIndex: 'status',
      width: 85,
      render: (v: string) =>
        v === 'ERROR' ? <Tag color="red">ERROR</Tag> : <Tag color="orange">PENDING</Tag>,
    },
    {
      title: t('errorCode'),
      dataIndex: 'errorFlag',
      width: 100,
      ellipsis: true,
    },
    {
      title: t('errorMessage'),
      dataIndex: 'errorMessage',
      ellipsis: true,
      render: (v: string | null) =>
        v ? (
          <Text
            style={{ color: '#ff4d4f', cursor: 'pointer' }}
            ellipsis
            onClick={() => setErrorModalContent(v)}
          >
            {v}
          </Text>
        ) : '-',
    },
    {
      title: t('createdAt'),
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

  const allColumns: ColumnsType<SendRow> = [...buildDynamicColumns(rows ?? []), ...fixedColumns]

  const rowSelection: TableRowSelection<SendRow> = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => setSelectedIds(keys as string[]),
  }

  return (
    <div style={{ padding: 24, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── 검색 조건 + 통계 (같은 행) ── */}
      <Card size="small" styles={{ body: { padding: '10px 16px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select
            placeholder={t('selectTable')}
            value={selectedTable || undefined}
            onChange={setSelectedTable}
            options={(tables ?? []).map((tbl) => ({ label: tbl.tableName, value: tbl.tableName }))}
            style={{ width: 220 }}
            showSearch
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={!selectedTable}
          >
            {t('search')}
          </Button>

          <Divider type="vertical" style={{ height: 24 }} />

          {/* 통계 — 텍스트 인라인 */}
          <Space size={20}>
            <Text>
              {t('pendingRows')}:{' '}
              <Text strong style={{ color: '#faad14' }}>{pendingCount}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}> 건</Text>
            </Text>
            <Text>
              {t('errorRows')}:{' '}
              <Text strong style={{ color: '#ff4d4f' }}>{errorCount}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}> 건</Text>
            </Text>
          </Space>
        </div>
      </Card>

      {/* ── 그리드 ── */}
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        styles={{ body: { flex: 1, padding: '0 0 8px', overflow: 'hidden' } }}
        title={
          <Text>
            {t('errorList')}
            {selectedIds.length > 0 && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{selectedIds.length}건 선택</Tag>
            )}
          </Text>
        }
        extra={
          <Space>
            <Button
              icon={<SendOutlined />}
              danger
              onClick={handleManualRetransmit}
              loading={retransmit.isPending}
              disabled={!searched || !rows?.length}
              size="small"
            >
              {selectedIds.length > 0
                ? `${t('retransmitSelected')} (${selectedIds.length}건)`
                : t('retransmitAll')}
            </Button>

            <Dropdown
              menu={{
                items: AUTO_INTERVAL_OPTIONS.map((o) => ({
                  key: String(o.value),
                  label: o.label,
                  onClick: () => setAutoInterval(o.value),
                })),
              }}
              trigger={['click']}
            >
              <Button
                icon={<ClockCircleOutlined />}
                type={autoRetransmit ? 'primary' : 'default'}
                onClick={() => setAutoRetransmit((p) => !p)}
                disabled={!selectedTable}
                size="small"
              >
                {t('autoRetransmit')} {autoRetransmit ? `ON (${autoInterval}s)` : 'OFF'} ▾
              </Button>
            </Dropdown>
          </Space>
        }
      >
        <Table<SendRow>
          dataSource={rows ?? []}
          columns={allColumns}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{ pageSize: 50, showSizeChanger: false, size: 'small' }}
          size="small"
          scroll={{ x: 'max-content', y: GRID_SCROLL_Y }}
          locale={{ emptyText: searched ? t('noErrors') : t('selectAndSearch') }}
        />
      </Card>

      {/* ── 에러 메시지 모달 ── */}
      <Modal
        title={t('errorDetail')}
        open={!!errorModalContent}
        onCancel={() => setErrorModalContent(null)}
        footer={null}
        width={640}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>
          {errorModalContent}
        </pre>
      </Modal>
    </div>
  )
}
