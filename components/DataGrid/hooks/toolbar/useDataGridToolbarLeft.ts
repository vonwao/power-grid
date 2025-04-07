import { useGridMode } from '../../context/GridModeContext';
import { useGridForm } from '../../context/GridFormContext';

export interface DataGridToolbarLeftState {
  mode: string;
  isEditing: boolean;
  isAddingRow: boolean;
  editingRowCount: number;
  hasValidationErrors: boolean;
  validationErrors: Array<any>;
  canAdd: boolean;
  canSave: boolean;
  canCancel: boolean;
}

export interface DataGridToolbarLeftActions {
  addRow: () => void;
  saveChanges: () => void;
  cancelChanges: () => void;
}

export type DataGridToolbarLeftProps = DataGridToolbarLeftState & DataGridToolbarLeftActions;

export function useDataGridToolbarLeft(): DataGridToolbarLeftProps {
  const { 
    mode, 
    addRow, 
    saveChanges, 
    cancelChanges, 
    hasValidationErrors 
  } = useGridMode();
  
  const { getEditedRowCount, getAllValidationErrors } = useGridForm();
  
  const isEditing = mode === 'edit' || mode === 'add';
  const isAddingRow = mode === 'add';
  const editingRowCount = getEditedRowCount();
  const validationErrors = getAllValidationErrors();
  
  // Derived state
  const canAdd = !isEditing;
  const canSave = isEditing && !hasValidationErrors;
  const canCancel = isEditing;
  
  return {
    mode,
    isEditing,
    isAddingRow,
    editingRowCount,
    hasValidationErrors,
    validationErrors,
    canAdd,
    addRow,
    canSave,
    saveChanges,
    canCancel,
    cancelChanges,
  };
}
