// Mock data for the MUI X Data Grid demo

// Reference data for departments (for autocomplete select)
export const departments = [
  { id: 1, label: 'Engineering' },
  { id: 2, label: 'Marketing' },
  { id: 3, label: 'Sales' },
  { id: 4, label: 'Finance' },
  { id: 5, label: 'Human Resources' },
  { id: 6, label: 'Research & Development' },
  { id: 7, label: 'Customer Support' },
  { id: 8, label: 'Operations' },
  { id: 9, label: 'Legal' },
  { id: 10, label: 'Product Management' },
];

// Employee data with various field types
export interface Employee {
  id: number;
  name: string;
  age: number;
  birthday: Date | null;
  active: boolean;
  departmentId: number | null;
}

export const employees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    age: 32,
    birthday: new Date(1992, 5, 15), // June 15, 1992
    active: true,
    departmentId: 1, // Engineering
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    birthday: new Date(1996, 2, 20), // March 20, 1996
    active: true,
    departmentId: 3, // Sales
  },
  {
    id: 3,
    name: 'Robert Johnson',
    age: 45,
    birthday: new Date(1979, 9, 10), // October 10, 1979
    active: false,
    departmentId: 4, // Finance
  },
  {
    id: 4,
    name: 'Emily Davis',
    age: 36,
    birthday: new Date(1988, 7, 5), // August 5, 1988
    active: true,
    departmentId: 2, // Marketing
  },
  {
    id: 5,
    name: 'Michael Wilson',
    age: 41,
    birthday: new Date(1983, 11, 25), // December 25, 1983
    active: true,
    departmentId: 6, // R&D
  },
  {
    id: 6,
    name: 'Sarah Brown',
    age: 29,
    birthday: new Date(1995, 3, 12), // April 12, 1995
    active: true,
    departmentId: 5, // HR
  },
  {
    id: 7,
    name: 'David Miller',
    age: 38,
    birthday: new Date(1986, 1, 8), // February 8, 1986
    active: false,
    departmentId: 7, // Customer Support
  },
  {
    id: 8,
    name: 'Jennifer Taylor',
    age: 33,
    birthday: new Date(1991, 4, 30), // May 30, 1991
    active: true,
    departmentId: 8, // Operations
  },
  {
    id: 9,
    name: 'Thomas Anderson',
    age: 44,
    birthday: new Date(1980, 8, 18), // September 18, 1980
    active: true,
    departmentId: 9, // Legal
  },
  {
    id: 10,
    name: 'Lisa Martinez',
    age: 31,
    birthday: new Date(1993, 10, 3), // November 3, 1993
    active: true,
    departmentId: 10, // Product Management
  },
];

// Helper function to get department label by ID
export const getDepartmentLabel = (departmentId: number | null): string => {
  if (departmentId === null) return '';
  const department = departments.find(dept => dept.id === departmentId);
  return department ? department.label : '';
};
