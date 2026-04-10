import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { GetContextMenuItems } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { AgGridReactProps } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useAppContext } from '../context/AppContext'

ModuleRegistry.registerModules([AllCommunityModule])

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
    <div
      className={isDark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}
      style={{ width: '100%', height }}
    >
      <AgGridReact<T>
        defaultColDef={defaultColDef}
        suppressMenuHide
        enableCellTextSelection
        getContextMenuItems={getContextMenuItems}
        {...props}
      />
    </div>
  )
}
