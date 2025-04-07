import { useDataGridToolbarLeft } from './useDataGridToolbarLeft';
import { useDataGridToolbarRight } from './useDataGridToolbarRight';

export interface DataGridToolbarOptions {
  enableFiltering?: boolean;
  enableExport?: boolean;
}

export function useDataGridToolbar(options: DataGridToolbarOptions = {}) {
  const leftProps = useDataGridToolbarLeft();
  const rightProps = useDataGridToolbarRight(options);
  
  return {
    ...leftProps,
    ...rightProps,
    // Common derived state
    isToolbarActive: leftProps.isEditing || rightProps.selectionModel.length > 0,
  };
}
