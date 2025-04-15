/**
 * Standalone script to generate test data
 * This script doesn't rely on imports to avoid module resolution issues
 */

const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// File paths
const stableDataFile = path.join(dataDir, 'stable-mtm-history.json');
const paginationTestFile = path.join(dataDir, 'pagination-test-data.json');

/**
 * Simple seedable random number generator
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
  
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  nextElement(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  nextDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(this.next() * daysAgo));
    return date;
  }
}

/**
 * Generate stable MTM History data
 */
function generateStableMTMHistoryData(count = 500, seed = 12345) {
  console.log(`Generating ${count} MTM History items with seed ${seed}...`);
  
  const random = new SeededRandom(seed);
  
  const commodities = ['Oil', 'Gas', 'Electricity', 'Coal'];
  const descriptions = [
    'Price adjustment',
    'Volume correction',
    'Contract amendment',
    'Market fluctuation',
    'Regulatory change',
    'Seasonal adjustment',
    'Quality premium',
    'Transport fee',
  ];
  
  const data = Array.from({ length: count }, (_, i) => {
    const date = random.nextDate(30);
    
    return {
      accounting_mtm_history_id: `MTM-${(i + 1).toString().padStart(5, '0')}`,
      adj_description: random.nextElement(descriptions),
      commodity: random.nextElement(commodities),
      deal_volume: Math.round(random.next() * 1000) / 10,
      created_at: date.toISOString(),
    };
  });
  
  // Save to file
  fs.writeFileSync(stableDataFile, JSON.stringify(data, null, 2));
  console.log(`Stable data saved to ${stableDataFile}`);
  
  return data;
}

/**
 * Generate pagination test data
 */
function generatePaginationTestData(data, pageSize = 25) {
  console.log(`Generating pagination test data with ${pageSize} items per page...`);
  
  // Calculate the number of pages
  const totalPages = Math.ceil(data.length / pageSize);
  
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
    
    // Encode cursors
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
  
  // Save to file
  fs.writeFileSync(paginationTestFile, JSON.stringify(paginationTestData, null, 2));
  console.log(`Pagination test data saved to ${paginationTestFile}`);
}

// Generate stable data
const stableData = generateStableMTMHistoryData();

// Generate pagination test data
generatePaginationTestData(stableData);

console.log('Test data generation complete!');