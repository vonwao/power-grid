/**
 * Issue Tracker Mock Data
 * 
 * This file provides mock data for the issue tracker demo.
 */

import { Issue, User, Tag, IssueStatus, IssuePriority, IssueType } from './types';

// Mock users
export const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    avatar: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    avatar: 'https://i.pravatar.cc/150?u=5'
  }
];

// Mock tags
export const tags: Tag[] = [
  { id: 1, name: 'Frontend', color: '#2196f3' },
  { id: 2, name: 'Backend', color: '#4caf50' },
  { id: 3, name: 'UI/UX', color: '#9c27b0' },
  { id: 4, name: 'Database', color: '#ff9800' },
  { id: 5, name: 'DevOps', color: '#f44336' },
  { id: 6, name: 'Security', color: '#607d8b' },
  { id: 7, name: 'Performance', color: '#009688' },
  { id: 8, name: 'Testing', color: '#673ab7' }
];

// Helper function to get random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get a random date within a range
const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Generate mock issues
export const generateIssues = (count: number): Issue[] => {
  const issues: Issue[] = [];
  
  for (let i = 1; i <= count; i++) {
    const status = Object.values(IssueStatus)[Math.floor(Math.random() * 4)];
    const priority = Object.values(IssuePriority)[Math.floor(Math.random() * 4)];
    const type = Object.values(IssueType)[Math.floor(Math.random() * 5)];
    const reporterId = Math.floor(Math.random() * 5) + 1;
    const assigneeId = Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : undefined;
    const tagIds = getRandomItems(tags, Math.floor(Math.random() * 3) + 1).map(tag => tag.id);
    
    // Create a date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Create a date 30 days in the future
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const createdDate = getRandomDate(thirtyDaysAgo, new Date());
    
    // Only set due date for non-closed issues
    const dueDate = status !== IssueStatus.CLOSED ? 
      (Math.random() > 0.3 ? getRandomDate(new Date(), thirtyDaysLater) : undefined) : 
      undefined;
    
    // Only set resolution for resolved or closed issues
    const resolution = [IssueStatus.RESOLVED, IssueStatus.CLOSED].includes(status) ?
      'Issue has been fixed and verified.' : 
      undefined;
    
    issues.push({
      id: i,
      title: `Issue ${i}: ${type} - ${['Login page error', 'Dashboard not loading', 'API integration failing', 'Performance issue', 'Security vulnerability', 'UI alignment problem', 'Data not saving', 'Broken link', 'Missing feature', 'Documentation update needed'][i % 10]}`,
      description: `This is a detailed description for issue ${i}. It explains the problem in detail and provides steps to reproduce.`,
      status,
      priority,
      type,
      assigneeId,
      reporterId,
      createdDate,
      dueDate,
      resolution,
      tagIds
    });
  }
  
  return issues;
};

// Generate 50 mock issues
export const issues = generateIssues(50);

// Add references to related entities
export const issuesWithReferences = issues.map(issue => ({
  ...issue,
  assignee: issue.assigneeId ? users.find(user => user.id === issue.assigneeId) : undefined,
  reporter: users.find(user => user.id === issue.reporterId),
  tags: issue.tagIds ? issue.tagIds.map(id => tags.find(tag => tag.id === id)).filter(Boolean) as Tag[] : []
}));
