import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { AgGridReactProps } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useAppContext } from '../context/AppContext'

// 앱 전체에서 한 번만 등록
ModuleRegistry.registerModules([AllCommunityModule])

const defaultColDef = {
  filter: true,
  resizable: true,
  minWidth: 60,
  headerClass: 'center-header',
}

type Props<T extends object> = AgGridReactProps<T> & {
  height?: string | number
}

export default function AppGrid<T extends object>({ height = '100%', ...props }: Props<T>) {
  const { isDark } = useAppContext()
  return (
    <div
      className={isDark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}
      style={{ width: '100%', height }}
    >
      <AgGridReact<T>
        defaultColDef={defaultColDef}
        suppressMenuHide           // 컬럼 헤더 메뉴 버튼 항상 표시
        enableCellTextSelection    // 셀 텍스트 드래그 선택 허용
        {...props}
      />
    </div>
  )
}
