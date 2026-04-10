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

  const btnClass = `sider-footer-btn ${collapsed ? 'collapsed' : 'expanded'}`

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
          <div className={`sider-header${collapsed ? ' collapsed' : ''}`}>
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

          <div className="sider-footer">
            <Tooltip title={isDark ? t('lightMode') : t('darkMode')} placement="right">
              <Button
                type="text"
                icon={isDark ? <MoonOutlined /> : <SunOutlined />}
                onClick={() => setIsDark(!isDark)}
                className={btnClass}
              >
                {!collapsed && (isDark ? t('darkMode') : t('lightMode'))}
              </Button>
            </Tooltip>

            <Tooltip title={lang === 'ko' ? '한국어' : 'English'} placement="right">
              <Button
                type="text"
                onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
                className={btnClass}
              >
                {collapsed ? (lang === 'ko' ? '한' : 'EN') : (lang === 'ko' ? '한국어' : 'English')}
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
