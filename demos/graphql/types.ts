export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  status: string;
  department: string;
  salary: number;
}

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  status: string;
  department: string;
  salary: number;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export interface GraphQLQueryOptions<V = Record<string, unknown>> {
  query: string;
  variables?: V;
  enabled?: boolean;
  fallbackData?: any;
}

export interface GraphQLMutationOptions<V = Record<string, unknown>> {
  mutation: string;
  variables: V;
  optimisticResponse?: any;
}

export interface UpdateEmployeeInput {
  id: number;
  input: EmployeeInput;
}

export interface CreateEmployeeInput {
  input: EmployeeInput;
}

export interface EmployeeQueryResponse {
  employees: Employee[];
}

export interface UpdateEmployeeMutationResponse {
  updateEmployee: Employee;
}

export interface CreateEmployeeMutationResponse {
  createEmployee: Employee;
}
