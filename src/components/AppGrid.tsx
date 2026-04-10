import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
import type { GetContextMenuItems } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { AgGridReactProps } from 'ag-grid-react'
import { useAppContext } from '../context/AppContext'

ModuleRegistry.registerModules([AllCommunityModule])

// CSS 클래스 방식 대신 theme prop 방식으로 다크모드 확실히 적용
const lightTheme = themeQuartz.withParams({
  accentColor: '#1677ff',
  selectedRowBackgroundColor: '#e6f4ff',
})

const darkTheme = themeQuartz.withParams({
  backgroundColor: '#1f1f1f',
  headerBackgroundColor: '#141414',
  accentColor: '#1677ff',
  selectedRowBackgroundColor: 'rgba(24, 144, 255, 0.25)',
  foregroundColor: 'rgba(255, 255, 255, 0.85)',
  borderColor: 'rgba(255, 255, 255, 0.12)',
  chromeBackgroundColor: '#141414',
})

const defaultColDef = {
  filter: true,
  resizable: true,
  minWidth: 60,
  headerClass: 'center-header',
}

const getContextMenuItems: GetContextMenuItems = () => [
  'copy',
  'copyWithHeaders',
  'separator',
  'csvExport',
]

type Props<T extends object> = AgGridReactProps<T> & {
  height?: string | number
}

export default function AppGrid<T extends object>({ height = '100%', ...props }: Props<T>) {
  const { isDark } = useAppContext()
  return (
    <div style={{ width: '100%', height }}>
      <AgGridReact<T>
        theme={isDark ? darkTheme : lightTheme}
        defaultColDef={defaultColDef}
        suppressMenuHide
        enableCellTextSelection
        getContextMenuItems={getContextMenuItems}
        {...props}
      />
    </div>
  )
}
