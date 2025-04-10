import { gql } from 'apollo-server-micro';

// Define the GraphQL schema for the issue tracker
export const typeDefs = gql`
  # Enums
  enum IssueStatus {
    Open
    In_Progress
    Resolved
    Closed
  }

  enum IssuePriority {
    Low
    Medium
    High
    Critical
  }

  enum IssueType {
    Bug
    Feature
    Task
    Enhancement
    Documentation
  }

  enum SortDirection {
    asc
    desc
  }

  # User type
  type User {
    id: Int!
    name: String!
    email: String!
    avatar: String
  }

  # Tag type
  type Tag {
    id: Int!
    name: String!
    color: String!
  }

  # Issue type
  type Issue {
    id: Int!
    title: String!
    description: String!
    status: IssueStatus!
    priority: IssuePriority!
    type: IssueType!
    assigneeId: Int
    assignee: User
    reporterId: Int!
    reporter: User
    createdDate: String!
    dueDate: String
    resolution: String
    tagIds: [Int!]
    tags: [Tag!]
  }

  # Input types
  input IssueFilterInput {
    id: Int
    title: String
    status: IssueStatus
    priority: IssuePriority
    type: IssueType
    assigneeId: Int
    reporterId: Int
    dueDate: String
    tagIds: [Int!]
  }

  input SortInput {
    field: String!
    direction: SortDirection!
  }

  input IssueInput {
    title: String!
    description: String!
    status: IssueStatus!
    priority: IssuePriority!
    type: IssueType!
    assigneeId: Int
    reporterId: Int!
    dueDate: String
    resolution: String
    tagIds: [Int!]
  }

  input IssueUpdateInput {
    title: String
    description: String
    status: IssueStatus
    priority: IssuePriority
    type: IssueType
    assigneeId: Int
    reporterId: Int
    dueDate: String
    resolution: String
    tagIds: [Int!]
  }

  # Paginated result type
  type IssuesResult {
    rows: [Issue!]!
    totalRows: Int!
  }

  # Queries
  type Query {
    # Get all users
    users: [User!]!
    
    # Get a single user by ID
    user(id: Int!): User
    
    # Get all tags
    tags: [Tag!]!
    
    # Get a single tag by ID
    tag(id: Int!): Tag
    
    # Get issues with pagination, sorting, and filtering
    issues(
      page: Int = 0
      pageSize: Int = 25
      sort: SortInput
      filter: IssueFilterInput
    ): IssuesResult!
    
    # Get a single issue by ID
    issue(id: Int!): Issue
  }

  # Mutations
  type Mutation {
    # Create a new issue
    createIssue(input: IssueInput!): Issue!
    
    # Update an existing issue
    updateIssue(id: Int!, input: IssueUpdateInput!): Issue!
    
    # Delete an issue
    deleteIssue(id: Int!): Boolean!
    
    # Update multiple issues at once
    updateIssues(ids: [Int!]!, input: IssueUpdateInput!): [Issue!]!
  }
`;
