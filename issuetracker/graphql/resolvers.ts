import { users, tags, issues, issuesWithReferences } from '../mockData';
import { Issue, IssueStatus, IssuePriority, IssueType } from '../types';

// Cache for issues
let cachedIssues = [...issuesWithReferences];

/**
 * GraphQL resolvers for the issue tracker
 */
export const resolvers = {
  Query: {
    // Get all users
    users: () => users,
    
    // Get a single user by ID
    user: (_: any, { id }: { id: number }) => {
      return users.find(user => user.id === id) || null;
    },
    
    // Get all tags
    tags: () => tags,
    
    // Get a single tag by ID
    tag: (_: any, { id }: { id: number }) => {
      return tags.find(tag => tag.id === id) || null;
    },
    
    // Get issues with pagination, sorting, and filtering
    issues: (_: any, args: {
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
      
      // Apply filters
      let filteredData = [...cachedIssues];
      
      Object.entries(filter).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (field === 'tagIds' && Array.isArray(value)) {
            // Filter by tags - issue must have at least one of the specified tags
            filteredData = filteredData.filter(issue => {
              const issueTags = issue.tagIds || [];
              return value.some((tagId: number) => issueTags.includes(tagId));
            });
          } else {
            // Filter by other fields
            filteredData = filteredData.filter(item => {
              const itemValue = (item as any)[field];
              
              if (typeof value === 'string') {
                return String(itemValue).toLowerCase().includes(value.toLowerCase());
              }
              
              return itemValue === value;
            });
          }
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
    
    // Get a single issue by ID
    issue: (_: any, { id }: { id: number }) => {
      return cachedIssues.find(issue => issue.id === id) || null;
    },
  },
  
  Mutation: {
    // Create a new issue
    createIssue: (_: any, { input }: { input: Omit<Issue, 'id'> }) => {
      // Generate a new ID
      const newId = Math.max(...cachedIssues.map(issue => issue.id)) + 1;
      
      // Create the new issue
      const newIssue = {
        id: newId,
        ...input,
        createdDate: new Date().toISOString().split('T')[0],
      };
      
      // Add references
      const issueWithRefs = {
        ...newIssue,
        assignee: newIssue.assigneeId ? users.find(user => user.id === newIssue.assigneeId) : undefined,
        reporter: users.find(user => user.id === newIssue.reporterId),
        tags: newIssue.tagIds ? newIssue.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean) : []
      };
      
      // Add to cache
      cachedIssues.push(issueWithRefs as any);
      
      return issueWithRefs;
    },
    
    // Update an existing issue
    updateIssue: (_: any, { id, input }: { id: number; input: Partial<Issue> }) => {
      // Find the issue
      const issueIndex = cachedIssues.findIndex(issue => issue.id === id);
      
      if (issueIndex === -1) {
        throw new Error(`Issue with ID ${id} not found`);
      }
      
      // Update the issue
      const updatedIssue = {
        ...cachedIssues[issueIndex],
        ...input,
      };
      
      // Update references
      const issueWithRefs = {
        ...updatedIssue,
        assignee: updatedIssue.assigneeId ? users.find(user => user.id === updatedIssue.assigneeId) : undefined,
        reporter: users.find(user => user.id === updatedIssue.reporterId),
        tags: updatedIssue.tagIds ? updatedIssue.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean) : []
      };
      
      // Update cache
      cachedIssues[issueIndex] = issueWithRefs as any;
      
      return issueWithRefs;
    },
    
    // Delete an issue
    deleteIssue: (_: any, { id }: { id: number }) => {
      // Find the issue
      const issueIndex = cachedIssues.findIndex(issue => issue.id === id);
      
      if (issueIndex === -1) {
        throw new Error(`Issue with ID ${id} not found`);
      }
      
      // Remove from cache
      cachedIssues.splice(issueIndex, 1);
      
      return true;
    },
    
    // Update multiple issues at once
    updateIssues: (_: any, { ids, input }: { ids: number[]; input: Partial<Issue> }) => {
      const updatedIssues = [];
      
      for (const id of ids) {
        // Find the issue
        const issueIndex = cachedIssues.findIndex(issue => issue.id === id);
        
        if (issueIndex !== -1) {
          // Update the issue
          const updatedIssue = {
            ...cachedIssues[issueIndex],
            ...input,
          };
          
          // Update references
          const issueWithRefs = {
            ...updatedIssue,
            assignee: updatedIssue.assigneeId ? users.find(user => user.id === updatedIssue.assigneeId) : undefined,
            reporter: users.find(user => user.id === updatedIssue.reporterId),
            tags: updatedIssue.tagIds ? updatedIssue.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean) : []
          };
          
          // Update cache
          cachedIssues[issueIndex] = issueWithRefs as any;
          
          updatedIssues.push(issueWithRefs);
        }
      }
      
      return updatedIssues;
    },
  },
  
  // Resolve references for Issue type
  Issue: {
    assignee: (parent: Issue) => {
      if (!parent.assigneeId) return null;
      return users.find(user => user.id === parent.assigneeId) || null;
    },
    reporter: (parent: Issue) => {
      return users.find(user => user.id === parent.reporterId) || null;
    },
    tags: (parent: Issue) => {
      if (!parent.tagIds) return [];
      return parent.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean);
    },
  },
};
