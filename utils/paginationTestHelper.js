/**
 * Pagination Test Helper
 * Utilities to help test pagination by capturing expected state
 */

const fs = require('fs');
const path = require('path');
const { loadDataFromFile } = require('./stableDataGenerator');

/**
 * Generate pagination test data from stable data
 * This simulates how the server would paginate the data
 * @param {string} dataFilePath - Path to the stable data file
 * @param {number} pageSize - Number of items per page
 * @param {string} outputFilePath - Path to save the pagination test data
 */
function generatePaginationTestData(
  dataFilePath = './data/stable-mtm-history.json',
  pageSize = 25,
  outputFilePath = './data/pagination-test-data.json'
) {
  try {
    // Load the stable data
    const data = loadDataFromFile(dataFilePath);
    
    if (!data || data.length === 0) {
      console.error('No data found in', dataFilePath);
      return;
    }
    
    // Calculate the number of pages
    const totalPages = Math.ceil(data.length / pageSize);
    console.log(`Generating pagination test data for ${totalPages} pages with ${pageSize} items per page`);
    
    // Generate pagination test data
    const paginationTestData = {
      pages: {},
      totalCount: data.length,
    };
    
    // Generate data for each page
    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, data.length);
      const items = data.slice(startIndex, endIndex);
      
      // Encode cursors (simplified version - in real app this would match the server encoding)
      const startCursor = Buffer.from(JSON.stringify({
        id: items[0].accounting_mtm_history_id,
        commodity: items[0].commodity,
      })).toString('base64');
      
      const endCursor = Buffer.from(JSON.stringify({
        id: items[items.length - 1].accounting_mtm_history_id,
        commodity: items[items.length - 1].commodity,
      })).toString('base64');
      
      // Add page data
      paginationTestData.pages[page] = {
        items,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
        startCursor,
        endCursor,
      };
    }
    
    // Save the pagination test data
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputFilePath, JSON.stringify(paginationTestData, null, 2));
    console.log(`Pagination test data saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating pagination test data:', error);
  }
}

/**
 * Verify pagination results against expected data
 * @param {number} page - Current page number
 * @param {Array} items - Items displayed on the current page
 * @param {string} testDataFilePath - Path to the pagination test data file
 * @returns {Object} Object with verification results
 */
function verifyPaginationResults(
  page,
  items,
  testDataFilePath = './data/pagination-test-data.json'
) {
  try {
    // Load the pagination test data
    const testData = loadDataFromFile(testDataFilePath);
    
    if (!testData) {
      return {
        success: false,
        errors: ['Pagination test data not found'],
        expectedItems: [],
      };
    }
    
    // Get the expected data for this page
    const expectedPageData = testData.pages[page];
    
    if (!expectedPageData) {
      return {
        success: false,
        errors: [`No expected data found for page ${page}`],
        expectedItems: [],
      };
    }
    
    // Compare the items
    const errors = [];
    
    // Check item count
    if (items.length !== expectedPageData.items.length) {
      errors.push(`Item count mismatch: expected ${expectedPageData.items.length}, got ${items.length}`);
    }
    
    // Check each item
    for (let i = 0; i < Math.min(items.length, expectedPageData.items.length); i++) {
      const actualItem = items[i];
      const expectedItem = expectedPageData.items[i];
      
      if (actualItem.accounting_mtm_history_id !== expectedItem.accounting_mtm_history_id) {
        errors.push(`Item ${i} ID mismatch: expected ${expectedItem.accounting_mtm_history_id}, got ${actualItem.accounting_mtm_history_id}`);
      }
      
      if (actualItem.commodity !== expectedItem.commodity) {
        errors.push(`Item ${i} commodity mismatch: expected ${expectedItem.commodity}, got ${actualItem.commodity}`);
      }
      
      if (actualItem.deal_volume !== expectedItem.deal_volume) {
        errors.push(`Item ${i} deal_volume mismatch: expected ${expectedItem.deal_volume}, got ${actualItem.deal_volume}`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors,
      expectedItems: expectedPageData.items,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Error verifying pagination results: ${error}`],
      expectedItems: [],
    };
  }
}

module.exports = {
  generatePaginationTestData,
  verifyPaginationResults
};