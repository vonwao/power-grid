# MTM History Pagination Data Flow

This document visualizes the data flow for the MTM History pagination implementation and highlights where the current issues occur.

## Current Flow (With Issues)

```mermaid
sequenceDiagram
    participant FE as Frontend (mtm-history.tsx)
    participant GQL as GraphQL Layer
    participant BE as Backend Service
    participant DB as DynamoDB

    FE->>GQL: Query mtmHistory(first: 25, sort: "...")
    Note over FE,GQL: Missing filter variables with key conditions
    GQL->>BE: mtmHistory resolver calls service
    BE->>DB: Query without KeyConditionExpression
    DB-->>BE: Error: KeyConditions must be specified
    BE-->>GQL: Error response
    GQL-->>FE: Error response

    Note over FE,DB: When pagination works but returns same records:
    FE->>GQL: Query mtmHistory(first: 25, after: "cursor", sort: "...")
    GQL->>BE: mtmHistory resolver with cursor
    BE->>DB: Query with same/incorrect ExclusiveStartKey
    DB-->>BE: Same records as first page
    BE-->>GQL: Connection with same records
    GQL-->>FE: Same records displayed again
```

## Proposed Solution Flow

```mermaid
sequenceDiagram
    participant FE as Frontend (mtm-history.tsx)
    participant GQL as GraphQL Layer
    participant BE as Backend Service
    participant DB as DynamoDB

    FE->>GQL: Query mtmHistory(first: 25, filter: {user_id: "default"}, sort: "...")
    Note over FE,GQL: Added required filter variables
    GQL->>BE: mtmHistory resolver calls service
    BE->>DB: Query with KeyConditionExpression
    DB-->>BE: First page of results
    BE-->>GQL: Connection with edges, pageInfo
    GQL-->>FE: Display first page

    FE->>GQL: Query mtmHistory(first: 25, after: "cursor", filter: {user_id: "default"}, sort: "...")
    GQL->>BE: mtmHistory resolver with cursor
    BE->>DB: Query with correct ExclusiveStartKey
    DB-->>BE: Next page of results
    BE-->>GQL: Connection with new edges, pageInfo
    GQL-->>FE: Display second page
```

## Mock Implementation Architecture

```mermaid
graph TD
    A[Frontend Request] --> B[GraphQL Resolver]
    B --> C{Validate Key Conditions}
    C -->|Missing| D[Return Error]
    C -->|Valid| E[Get Mock Data]
    E --> F[Apply Filters]
    F --> G[Apply Sorting]
    G --> H[Apply Cursor Pagination]
    H --> I[Format as Connection]
    I --> J[Return Response]

    style C fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#ccf,stroke:#333,stroke-width:2px
```

## Data Transformation Flow

```mermaid
graph LR
    A[Raw Query Args] --> B[Parse Filter]
    A --> C[Parse Sort]
    A --> D[Extract Cursor]
    B --> E[Validate Key Conditions]
    E --> F[Filter Data]
    C --> G[Sort Data]
    F --> G
    G --> H[Find Start Position]
    D --> H
    H --> I[Slice Data]
    I --> J[Create Edges]
    I --> K[Calculate PageInfo]
    J --> L[Return Connection]
    K --> L

    style E fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#ccf,stroke:#333,stroke-width:2px
    style J fill:#cfc,stroke:#333,stroke-width:2px
```

## Key Components and Responsibilities

### Frontend (`pages/mtm-history.tsx`)
- Provide required filter variables with key conditions
- Pass the GraphQL query and variables to EnhancedDataGridGraphQL
- Handle UI interactions and display

### GraphQL Resolver (`graphql/resolvers/mtm-history.ts`)
- Parse and validate query arguments
- Enforce key condition requirements
- Apply filtering, sorting, and pagination
- Format response as a Relay Connection

### Mock Data Service
- Generate and cache mock MTM history data
- Simulate DynamoDB behavior for testing
- Implement cursor-based pagination logic

### DynamoDB Pagination Service (Real Implementation)
- Build proper KeyConditionExpression from filter
- Handle cursor-based pagination with ExclusiveStartKey
- Apply additional filtering and sorting
- Return consistent Connection structure