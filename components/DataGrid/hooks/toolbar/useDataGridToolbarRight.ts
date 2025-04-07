import { useGridSelection } from '../../context/GridSelectionContext';
import { DataGridToolbarOptions } from './useDataGridToolbar';

export interface DataGridToolbarRightState {
  selectionModel: Array<string | number>;
  hasSelection: boolean;
  enableFiltering: boolean;
  enableExport: boolean;
}

export interface DataGridToolbarRightActions {
  clearSelection: () => void;
  handleFilter: () => void;
  handleExport: () => void;
}

export type DataGridToolbarRightProps = DataGridToolbarRightState & DataGridToolbarRightActions;

export function useDataGridToolbarRight(options: DataGridToolbarOptions = {}): DataGridToolbarRightProps {
  const { 
    selectionModel, 
    clearSelection 
  } = useGridSelection();

  const { enableFiltering = true, enableExport = true } = options;
  
  const handleFilter = () => {
    // Implement filtering logic
    console.log('Filter clicked');
  };

  const handleExport = () => {
    // Implement export logic
    console.log('Export clicked');
  };

  return {
    selectionModel,
    hasSelection: selectionModel.length > 0,
    enableFiltering,
    enableExport,
    clearSelection,
    handleFilter,
    handleExport,
  };
}
