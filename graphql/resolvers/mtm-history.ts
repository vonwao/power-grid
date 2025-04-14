// Generate mock MTM History data
function generateMTMHistoryData(count = 100) {
  return Array.from({ length: count }, (_, i) => ({
    accounting_mtm_history_id: `MTM-${i + 1}`,
    adj_description: `Adjustment ${i + 1}`,
    commodity: ['Oil', 'Gas', 'Electricity', 'Coal'][Math.floor(Math.random() * 4)],
    deal_volume: Math.round(Math.random() * 1000) / 10,
  }));
}

// Cache generated data
let cachedMTMHistory: ReturnType<typeof generateMTMHistoryData> | null = null;

function getMTMHistoryData() {
  if (!cachedMTMHistory) {
    console.log('Generating MTM History data...');
    cachedMTMHistory = generateMTMHistoryData(500);
    console.log('MTM History data generation complete.');
  }
  return cachedMTMHistory;
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
      const {
        first = 25,
        after,
        filter,
        sort,
      } = args;
      
      console.log('MTM History Query:', { first, after, filter, sort });
      
      // Get data
      let data = getMTMHistoryData();
      
      // Apply filtering if provided
      if (filter) {
        try {
          const filterObj = JSON.parse(filter);
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
        } catch (e) {
          console.error('Error parsing filter:', e);
        }
      }
      
      // Apply sorting if provided
      if (sort) {
        const isDesc = sort.startsWith('-');
        const sortField = isDesc ? sort.substring(1) : sort;
        
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
      
      // Find the index to start from based on the cursor
      let startIndex = 0;
      if (after) {
        const afterIndex = data.findIndex(item => 
          `MTM-${item.accounting_mtm_history_id}` === after
        );
        if (afterIndex >= 0) {
          startIndex = afterIndex + 1;
        }
      }
      
      // Apply pagination
      const paginatedData = data.slice(startIndex, startIndex + first);
      
      // Create edges
      const edges = paginatedData.map(node => ({
        cursor: node.accounting_mtm_history_id,
        node,
      }));
      
      // Create page info
      const hasNextPage = startIndex + first < data.length;
      const hasPreviousPage = startIndex > 0;
      
      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: data.length,
      };
    }
  }
};