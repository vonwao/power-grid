/**
 * Enhanced MTM History resolver with improved pagination, sorting, and filtering
 * This implementation simulates DynamoDB behavior with cursor-based pagination
 */

// Define the MTM History item interface
interface MTMHistoryItem {
  accounting_mtm_history_id: string;
  adj_description: string;
  commodity: string;
  deal_volume: number;
  created_at?: string; // Optional timestamp for sorting
}

// Generate mock MTM History data with more realistic values
function generateMTMHistoryData(count = 100): MTMHistoryItem[] {
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
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      accounting_mtm_history_id: `MTM-${(i + 1).toString().padStart(5, '0')}`,
      adj_description: descriptions[Math.floor(Math.random() * descriptions.length)],
      commodity: commodities[Math.floor(Math.random() * commodities.length)],
      deal_volume: Math.round(Math.random() * 1000) / 10,
      created_at: date.toISOString(),
    };
  });
}

// Cache generated data
let cachedMTMHistory: MTMHistoryItem[] | null = null;

// Get or generate MTM History data
function getMTMHistoryData(): MTMHistoryItem[] {
  if (!cachedMTMHistory) {
    console.log('Generating MTM History data...');
    cachedMTMHistory = generateMTMHistoryData(500);
    console.log('MTM History data generation complete.');
    console.log('Sample data (first 2 items):', JSON.stringify(cachedMTMHistory.slice(0, 2), null, 2));
    console.log('Total items generated:', cachedMTMHistory.length);
  }
  return cachedMTMHistory;
}

/**
 * Encode a cursor from an item
 * This simulates DynamoDB's LastEvaluatedKey
 */
function encodeCursor(item: MTMHistoryItem): string {
  return Buffer.from(JSON.stringify({
    id: item.accounting_mtm_history_id,
    commodity: item.commodity,
  })).toString('base64');
}

/**
 * Decode a cursor back to an object
 */
function decodeCursor(cursor: string): { id: string; commodity: string } | null {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch (e) {
    console.error('Error decoding cursor:', e);
    return null;
  }
}

/**
 * Simulate DynamoDB's requirement for key conditions
 * This is just a simulation - real DynamoDB would require specific partition key conditions
 */
function validateKeyConditions(filter: any): boolean {
  // For this mock implementation, we'll just check if any filter is provided
  // In a real DynamoDB implementation, you would check for specific partition key
  return !!filter && Object.keys(filter).length > 0;
}

// MTM History resolvers
export const mtmHistoryResolvers = {
  Query: {
    mtmHistory: (_: any, args: {
      first?: number;
      after?: string;
      filter?: string;
      sort?: string;
    }) => {
      try {
        const {
          first = 25,
          after,
          filter: rawFilter,
          sort: rawSort,
        } = args;
        
        console.log('MTM History Query:', { first, after, filter: rawFilter, sort: rawSort });
        
        // Debug: Log the arguments received
        console.log('MTM History Query Args:', JSON.stringify(args, null, 2));
      
      // Parse filter (handle both string and object formats)
      let filterObj = {};
      if (rawFilter) {
        try {
          filterObj = typeof rawFilter === 'string' ? JSON.parse(rawFilter) : rawFilter;
        } catch (e) {
          console.error('Error parsing filter:', e);
        }
      }
      
      // Simulate DynamoDB key condition validation
      try {
        if (!validateKeyConditions(filterObj)) {
          console.warn('Warning: No filter conditions provided. In a real DynamoDB implementation, this would cause an error.');
          // In a real implementation, you might throw an error here:
          // throw new Error('KeyConditionExpression must be specified in the request');
        }
      } catch (e) {
        console.error('Key condition validation error:', e);
      }
      
      // Get data
      let data = getMTMHistoryData();
      
      // Apply filtering
      if (Object.keys(filterObj).length > 0) {
        Object.entries(filterObj).forEach(([field, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            data = data.filter(item => {
              const itemValue = (item as any)[field];
              
              if (typeof value === 'string') {
                return String(itemValue).toLowerCase().includes(value.toLowerCase());
              }
              
              return itemValue === value;
            });
          }
        });
      }
      
      // Parse and apply sorting
      if (rawSort) {
        try {
          // Parse sort parameter (expected format: JSON string of array with field and direction)
          const sortOptions = typeof rawSort === 'string' ? JSON.parse(rawSort) : rawSort;
          
          if (Array.isArray(sortOptions) && sortOptions.length > 0) {
            const { field: sortField, direction } = sortOptions[0];
            const isDesc = direction?.toUpperCase() === 'DESC';
            
            data.sort((a, b) => {
              const aValue = (a as any)[sortField];
              const bValue = (b as any)[sortField];
              
              if (aValue === bValue) return 0;
              
              let comparison;
              if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
              } else {
                comparison = aValue < bValue ? -1 : 1;
              }
              
              return isDesc ? -comparison : comparison;
            });
          }
        } catch (e) {
          console.error('Error parsing sort:', e);
        }
      }
      
      // Handle cursor-based pagination
      let startIndex = 0;
      if (after) {
        try {
          // Decode the cursor
          const decodedCursor = decodeCursor(after);
          
          if (decodedCursor) {
            // Find the index based on the cursor
            const afterIndex = data.findIndex(item =>
              item.accounting_mtm_history_id === decodedCursor.id
            );
            
            if (afterIndex >= 0) {
              startIndex = afterIndex + 1;
            } else {
              console.warn(`Item with ID ${decodedCursor.id} not found for cursor pagination`);
            }
          }
        } catch (e) {
          console.error('Error processing cursor:', e);
        }
      }
      
      // Apply pagination
      const paginatedData = data.slice(startIndex, startIndex + first);
      
      // Create edges with proper cursors
      const edges = paginatedData.map(node => ({
        cursor: encodeCursor(node),
        node,
      }));
      
      // Create page info
      const hasNextPage = startIndex + first < data.length;
      const hasPreviousPage = startIndex > 0;
      
      // Create the result object
      const result = {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: data.length,
      };
      
      // Debug: Log the result
      console.log('MTM History Query Result:', {
        edgesCount: edges.length,
        hasNextPage,
        hasPreviousPage,
        totalCount: data.length
      });
      
      return result;
      } catch (error) {
        console.error('Error in mtmHistory resolver:', error);
        // Return empty result instead of throwing error
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        };
      }
    }
  }
};