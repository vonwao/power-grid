import React, { createContext, useContext, useState } from 'react';

interface GridSelectionContextType {
  selectionModel: Array<string | number>;
  setSelectionModel: (model: Array<string | number>) => void;
  clearSelection: () => void;
}

const GridSelectionContext = createContext<GridSelectionContextType | undefined>(undefined);

export function GridSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectionModel, setSelectionModel] = useState<Array<string | number>>([]);

  const clearSelection = () => {
    setSelectionModel([]);
  };

  return (
    <GridSelectionContext.Provider value={{ selectionModel, setSelectionModel, clearSelection }}>
      {children}
    </GridSelectionContext.Provider>
  );
}

export function useGridSelection() {
  const context = useContext(GridSelectionContext);
  if (context === undefined) {
    throw new Error('useGridSelection must be used within a GridSelectionProvider');
  }
  return context;
}
