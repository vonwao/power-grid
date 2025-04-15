/**
 * Script to generate pagination test data
 * Run this script after generating stable data to create expected pagination results
 */

import { generatePaginationTestData } from '../utils/paginationTestHelper';

// Generate pagination test data with default parameters
// This will:
// 1. Load the stable data from ./data/stable-mtm-history.json
// 2. Generate pagination test data with 25 items per page
// 3. Save the results to ./data/pagination-test-data.json
generatePaginationTestData();

console.log('Pagination test data generation complete!');