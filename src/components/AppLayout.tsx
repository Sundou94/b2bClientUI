import { useState } from 'react'
import { Layout, Menu, Button, Tooltip } from 'antd'
import { DashboardOutlined, SyncOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const { Sider, Content } = Layout

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 200

export default function AppLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isDark, setIsDark, lang, setLang, t } = useAppContext()
  const [collapsed, setCollapsed] = useState(true)

  const selectedKey = pathname.startsWith('/if-summary') ? '/if-summary' : '/'

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: '/if-summary', icon: <SyncOutlined />, label: t('ifSummary') },
  ]

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        theme="dark"
        collapsed={collapsed}
        collapsedWidth={COLLAPSED_WIDTH}
        width={EXPANDED_WIDTH}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: collapsed ? '16px 0' : '16px',
              textAlign: collapsed ? 'center' : 'left',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'padding 0.2s ease',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {collapsed ? '📡' : t('ifClientMonitor')}
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              inlineCollapsed={collapsed}
              onClick={({ key }) => navigate(key)}
              style={{ borderRight: 0 }}
            />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <Tooltip title={isDark ? t('lightMode') : t('darkMode')} placement="right">
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setIsDark(!isDark)}
                style={{ color: '#fff', width: '100%', justifyContent: 'flex-start', paddingLeft: collapsed ? 20 : 16, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 0 }}
              >
                {!collapsed && (isDark ? t('lightMode') : t('darkMode'))}
              </Button>
            </Tooltip>

            <Tooltip title={lang === 'ko' ? 'English' : '한국어'} placement="right">
              <Button
                type="text"
                onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                style={{ color: '#fff', width: '100%', fontWeight: 600, fontSize: 13, justifyContent: 'flex-start', paddingLeft: collapsed ? 20 : 16, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 0 }}
              >
                {collapsed ? (lang === 'ko' ? '한' : 'EN') : (lang === 'ko' ? '🌐 English' : '🌐 한국어')}
              </Button>
            </Tooltip>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: COLLAPSED_WIDTH, height: '100vh', overflow: 'hidden', transition: 'margin-left 0.2s ease' }}>
        <Content style={{ height: '100vh', overflow: 'hidden', background: isDark ? '#141414' : '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
