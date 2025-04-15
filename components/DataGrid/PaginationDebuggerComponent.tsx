// components/DataGrid/components/PaginationDebuggerComponent.tsx

import React, { useState } from 'react';

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface PaginationDebuggerProps {
  enabled: boolean;
  debug?: {
    page?: number;
    direction?: string;
    cursors?: Record<string, string>;
    variables?: any;
    loading?: boolean;
    error?: string | null;
    rowCount?: number;
    totalCount?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  refetch?: () => Promise<any>;
  resetCursors?: () => void;
}

export const PaginationDebuggerComponent: React.FC<PaginationDebuggerProps> = ({
  enabled,
  debug,
  refetch,
  resetCursors
}) => {
  const [showDebug, setShowDebug] = useState(false);
  
  if (!enabled) return null;
  
  return (
    <>
      {/* Small toggle button in corner */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        style={{
          position: 'fixed',
          bottom: '5px',
          right: '5px',
          zIndex: 9999,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px'
        }}
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>
      
      {/* Debug panel */}
      {showDebug && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '5px',
          width: '350px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          zIndex: 9999,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Pagination Debug</h3>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Current Page:</strong> {debug?.page ?? 'N/A'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Direction:</strong> {debug?.direction ?? 'N/A'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Loading:</strong> {debug?.loading ? 'Yes' : 'No'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Row Count:</strong> {debug?.rowCount ?? 0} / {debug?.totalCount ?? 0}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Navigation:</strong> {debug?.hasNextPage ? '↓' : '✕'} {debug?.hasPreviousPage ? '↑' : '✕'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Variables:</strong>
            <pre style={{ 
              margin: '4px 0', 
              padding: '4px', 
              backgroundColor: '#f8f8f8', 
              fontSize: '10px',
              maxHeight: '60px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(debug?.variables ?? {}, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Cursors:</strong>
            <pre style={{ 
              margin: '4px 0', 
              padding: '4px', 
              backgroundColor: '#f8f8f8', 
              fontSize: '10px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(debug?.cursors ?? {}, null, 2)}
            </pre>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button 
              onClick={() => refetch?.()}
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              Force Refetch
            </button>
            
            <button 
              onClick={() => resetCursors?.()}
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              Reset Cursors
            </button>
          </div>
        </div>
      )}
    </>
  );
};