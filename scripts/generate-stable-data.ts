/**
 * Script to generate stable test data
 * Run this script before testing to ensure consistent data
 */

import { generateAndSaveStableMTMHistoryData } from '../utils/stableDataGenerator';

// Number of items to generate
const COUNT = 500;

// Seed for random number generator (keep this constant for reproducible tests)
const SEED = 12345;

// File path to save the data
const FILE_PATH = './data/stable-mtm-history.json';

// Generate and save the data
console.log(`Generating ${COUNT} MTM History items with seed ${SEED}...`);
generateAndSaveStableMTMHistoryData(COUNT, SEED, FILE_PATH);
console.log('Done!');