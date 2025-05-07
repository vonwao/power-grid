// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Set up Jest DOM matchers
const matchers = require('@testing-library/jest-dom/matchers');
expect.extend(matchers);

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
