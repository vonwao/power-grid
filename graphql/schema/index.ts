import { gql } from 'apollo-server-micro';

// Define the GraphQL schema
export const typeDefs = gql`
  # Department type
  type Department {
    id: Int!
    label: String!
  }

  # Employee type
  type Employee {
    id: Int!
    name: String!
    email: String!
    age: Int!
    birthday: String
    active: Boolean!
    departmentId: Int
    department: Department
  }

  # Pagination, sorting, and filtering input types
  input EmployeeFilterInput {
    id: Int
    name: String
    email: String
    age: Int
    active: Boolean
    departmentId: Int
  }

  input SortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    asc
    desc
  }

  # Paginated result type
  type EmployeesResult {
    rows: [Employee!]!
    totalRows: Int!
  }

  # Queries
  type Query {
    # Get all departments
    departments: [Department!]!
    
    # Get a single department by ID
    department(id: Int!): Department
    
    # Get employees with pagination, sorting, and filtering
    employees(
      page: Int = 0
      pageSize: Int = 25
      sort: SortInput
      filter: EmployeeFilterInput
    ): EmployeesResult!
  }
`;