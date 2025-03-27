import { Employee } from '../components/data/mockData';
import { generateEmployees } from '../utils/dataGenerator';

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
  return cachedEmployees;
}

/**
 * Simulate server-side operations
 * @param params Query parameters
 * @returns Paginated data with total count
 */
export async function fetchEmployees({
  page = 0,
  pageSize = 25,
  sortField = 'id',
  sortDirection = 'asc',
  filters = {},
}: {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get or generate data
  const employees = getEmployees();
  
  // Apply filters
  let filteredData = [...employees];
  
  Object.entries(filters).forEach(([field, value]) => {
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
  
  // Apply pagination
  const start = page * pageSize;
  const paginatedData = filteredData.slice(start, start + pageSize);
  
  // Return paginated data with total count
  return {
    rows: paginatedData,
    totalRows: filteredData.length,
  };
}

/**
 * Mock API endpoint for Next.js API routes
 */
export async function employeesApiHandler(req: any, res: any) {
  const { page, pageSize, sortField, sortDirection } = req.query;
  
  // Parse filters from query params
  const filters: Record<string, any> = {};
  Object.entries(req.query).forEach(([key, value]) => {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const field = key.slice(7, -1);
      filters[field] = value;
    }
  });
  
  const result = await fetchEmployees({
    page: page ? parseInt(page as string, 10) : 0,
    pageSize: pageSize ? parseInt(pageSize as string, 10) : 25,
    sortField: sortField as string || 'id',
    sortDirection: (sortDirection as 'asc' | 'desc') || 'asc',
    filters,
  });
  
  res.status(200).json(result);
}