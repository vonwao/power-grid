/**
 * Stable data generator for testing
 * Generates consistent data using a fixed seed for reproducible tests
 */

const fs = require('fs');
const path = require('path');

/**
 * Simple seedable random number generator
 * Based on a linear congruential generator
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  // Get a random number between 0 and 1
  next() {
    // LCG parameters (same as used in Java's Random)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // Update seed
    this.seed = (a * this.seed + c) % m;
    
    // Return a number between 0 and 1
    return this.seed / m;
  }
  
  // Get a random integer between min and max (inclusive)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // Get a random element from an array
  nextElement(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  // Get a random date within the last n days
  nextDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(this.next() * daysAgo));
    return date;
  }
}

/**
 * Generate stable MTM History data with a fixed seed
 * @param {number} count - Number of items to generate
 * @param {number} seed - Seed for random number generator
 * @returns {Array} Array of MTM History items
 */
function generateStableMTMHistoryData(count = 100, seed = 12345) {
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
  
  return Array.from({ length: count }, (_, i) => {
    // Generate a date within the last 30 days
    const date = random.nextDate(30);
    
    return {
      accounting_mtm_history_id: `MTM-${(i + 1).toString().padStart(5, '0')}`,
      adj_description: random.nextElement(descriptions),
      commodity: random.nextElement(commodities),
      deal_volume: Math.round(random.next() * 1000) / 10,
      created_at: date.toISOString(),
    };
  });
}

/**
 * Save generated data to a file
 * @param {any} data - Data to save
 * @param {string} filePath - Path to save the file
 */
function saveDataToFile(data, filePath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving data to file:', error);
  }
}

/**
 * Load data from a file
 * @param {string} filePath - Path to load the file from
 * @returns {any} Loaded data or null if file doesn't exist
 */
function loadDataFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading data from file:', error);
    return null;
  }
}

/**
 * Generate and save stable MTM History data
 * @param {number} count - Number of items to generate
 * @param {number} seed - Seed for random number generator
 * @param {string} filePath - Path to save the file
 */
function generateAndSaveStableMTMHistoryData(
  count = 100, 
  seed = 12345, 
  filePath = './data/stable-mtm-history.json'
) {
  const data = generateStableMTMHistoryData(count, seed);
  saveDataToFile(data, filePath);
}

module.exports = {
  generateStableMTMHistoryData,
  saveDataToFile,
  loadDataFromFile,
  generateAndSaveStableMTMHistoryData
};