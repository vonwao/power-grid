import { departments, Employee } from '../../components/data/mockData';
import { generateEmployees } from '../../utils/dataGenerator';

// Cache generated data
let cachedEmployees: Employee[] | null = null;

/**
 * Get or generate employees
 * @param count Number of employees to generate
 * @returns Array of employees
 */
function getEmployees(count = 10000): Employee[] {
  if (!cachedEmployees) {
    console.log(`Generating ${count} employees...`);
    cachedEmployees = generateEmployees(count);
    console.log('Employee generation complete.');
  }
  return cachedEmployees || [];
}

// GraphQL resolvers
export const resolvers = {
  Query: {
    // Get all departments
    departments: () => departments,
    
    // Get a single department by ID
    department: (_: any, { id }: { id: number }) => {
      return departments.find(dept => dept.id === id) || null;
    },
    
    // Get employees with pagination, sorting, and filtering
    employees: (_: any, args: {
      page?: number;
      pageSize?: number;
      sort?: { field: string; direction: 'asc' | 'desc' };
      filter?: Record<string, any>;
    }) => {
      const {
        page = 0,
        pageSize = 25,
        sort,
        filter = {},
      } = args;
      
      // Get or generate data
      const employees = getEmployees();
      
      // Apply filters
      let filteredData = [...employees];
      
      Object.entries(filter).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredData = filteredData.filter(item => {
            const itemValue = (item as any)[field];
            
            if (typeof value === 'string') {
              return String(itemValue).toLowerCase().includes(value.toLowerCase());
            }
            
            return itemValue === value;
          });
        }
      });
      
      // Apply sorting
      if (sort) {
        const { field: sortField, direction: sortDirection } = sort;
        
        filteredData.sort((a, b) => {
          const aValue = (a as any)[sortField];
          const bValue = (b as any)[sortField];
          
          if (aValue === bValue) return 0;
          
          // Handle different data types
          let comparison;
          if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() < bValue.getTime() ? -1 : 1;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else {
            comparison = aValue < bValue ? -1 : 1;
          }
          
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      
      // Apply pagination
      const start = page * pageSize;
      const paginatedData = filteredData.slice(start, start + pageSize);
      
      // Return paginated data with total count
      return {
        rows: paginatedData,
        totalRows: filteredData.length,
      };
    },
  },
  
  // Resolve department field for Employee type
  Employee: {
    department: (parent: Employee) => {
      if (!parent.departmentId) return null;
      return departments.find(dept => dept.id === parent.departmentId) || null;
    },
  },
};