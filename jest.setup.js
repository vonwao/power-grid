// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock the MUI X Data Grid
jest.mock('@mui/x-data-grid', () => {
  return {
    ...jest.requireActual('@mui/x-data-grid'),
    useGridApiRef: () => ({
      current: {
        startCellEditMode: jest.fn(),
        stopCellEditMode: jest.fn(),
        subscribeEvent: jest.fn(() => jest.fn()),
      }
    }),
  };
});
