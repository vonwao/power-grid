/**
 * Issue Tracker Types
 * 
 * This file defines the TypeScript interfaces for the issue tracker entities.
 */

// Issue status enum
export enum IssueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

// Issue priority enum
export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

// Issue type enum
export enum IssueType {
  BUG = 'Bug',
  FEATURE = 'Feature',
  TASK = 'Task',
  ENHANCEMENT = 'Enhancement',
  DOCUMENTATION = 'Documentation'
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// Tag interface
export interface Tag {
  id: number;
  name: string;
  color: string;
}

// Issue interface
export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId?: number;
  assignee?: User;
  reporterId: number;
  reporter?: User;
  createdDate: string;
  dueDate?: string;
  resolution?: string;
  tagIds?: number[];
  tags?: Tag[];
}

// GraphQL filter input
export interface IssueFilterInput {
  id?: number;
  title?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assigneeId?: number;
  reporterId?: number;
  dueDate?: string;
  tagIds?: number[];
}

// GraphQL sort input
export interface SortInput {
  field: string;
  direction: 'asc' | 'desc';
}

// GraphQL paginated result
export interface IssuesResult {
  rows: Issue[];
  totalRows: number;
}
