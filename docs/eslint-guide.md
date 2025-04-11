# ESLint Configuration Guide

## Overview

We've configured ESLint to check for unused variables and other code quality issues. The configuration is in `eslint.config.mjs` using the new flat config format.

## Current Configuration

The ESLint configuration has been set up to:

1. Extend Next.js recommended configurations (`next/core-web-vitals` and `next/typescript`)
2. Check for unused variables with error severity
3. Check for unused expressions
4. Apply TypeScript-specific rules for unused variables

## Available Scripts

- `npm run lint`: Run ESLint to check for issues
- `npm run lint:fix`: Run ESLint with auto-fix enabled
- `npm run lint:unused`: Run ESLint with zero tolerance for warnings
- `npm run lint:remove-unused`: Automatically remove unused variables from code

## Common Issues and How to Fix Them

### 1. Unused Variables

ESLint is configured to report errors for unused variables. There are several ways to fix these:

- **Remove the variable** if it's not needed (recommended approach)
  ```typescript
  // Before
  function example(unusedParam) {
    // ...
  }
  
  // After
  function example() {
    // ...
  }
  ```

- **Use the variable** if it's actually needed

- **Prefix with underscore** (`_`) as a last resort if the variable must be kept for API compatibility:
  ```typescript
  function example(_unusedParam) {
    // ...
  }
  ```

You can use the `npm run lint:remove-unused` script to automatically remove many unused variables from your code. The script handles:
- Import statements
- Function parameters
- Destructuring assignments
- Variable declarations

Note that some complex cases may require manual review.

### 2. TypeScript `any` Type

Many errors are related to the use of `any` type. To fix these:

- Replace `any` with a more specific type:
  ```typescript
  // Before
  function process(data: any) {
    // ...
  }
  
  // After
  interface DataType {
    id: string;
    value: number;
  }
  
  function process(data: DataType) {
    // ...
  }
  ```
- If the exact type is unknown, use `unknown` instead of `any`:
  ```typescript
  function process(data: unknown) {
    // Type guard before using
    if (typeof data === 'object' && data !== null && 'id' in data) {
      // Now TypeScript knows more about the shape
    }
  }
  ```
- For component props, create proper interfaces:
  ```typescript
  interface MyComponentProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  function MyComponent({ value, onChange }: MyComponentProps) {
    // ...
  }
  ```

### 3. React Hook Dependency Issues

ESLint warns about missing dependencies in React hooks. To fix these:

- Add the missing dependency to the dependency array:
  ```typescript
  // Before
  useEffect(() => {
    doSomething(value);
  }, []); // Missing dependency: value
  
  // After
  useEffect(() => {
    doSomething(value);
  }, [value]);
  ```
- If adding the dependency would cause an infinite loop, consider:
  - Using `useRef` for values that shouldn't trigger re-renders
  - Using `useCallback` to memoize functions
  - Using `useMemo` to memoize values

### 4. Unescaped Entities in JSX

Replace unescaped entities with their HTML entity codes:

```jsx
// Before
<p>Don't use unescaped entities</p>

// After
<p>Don&apos;t use unescaped entities</p>
```

## Systematic Approach to Fixing Issues

1. Start with the most critical files (core components, frequently used utilities)
2. Fix one type of issue at a time (e.g., fix all unused variables first)
3. Run `npm run lint` after each set of changes to verify progress
4. Commit changes in logical groups

## Best Practices Going Forward

1. **Avoid using `any` type** - Always define proper types or interfaces
2. **Prefix unused parameters with underscore** - This signals intent and satisfies ESLint
3. **Pay attention to React Hook dependencies** - Ensure all used variables are in the dependency array
4. **Run ESLint before committing** - Catch issues early

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [React Hooks ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)