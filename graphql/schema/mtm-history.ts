import { gql } from 'apollo-server-micro';

// Define the GraphQL schema for MTM History with Relay-style pagination
export const mtmHistoryTypeDefs = gql`
  # MTM History Node
  type MTMHistoryNode {
    accounting_mtm_history_id: String!
    adj_description: String
    commodity: String
    deal_volume: Float
  }

  # Edge type for Relay-style pagination
  type MTMHistoryEdge {
    cursor: String!
    node: MTMHistoryNode!
  }

  # Page info for Relay-style pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Connection type for Relay-style pagination
  type MTMHistoryConnection {
    edges: [MTMHistoryEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # Extend the Query type
  extend type Query {
    mtmHistory(
      first: Int
      after: String
      filter: String
      sort: String
    ): MTMHistoryConnection!
  }
`;