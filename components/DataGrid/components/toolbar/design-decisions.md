# DataGrid Toolbar Design Decisions

This document outlines the key design decisions made during the refactoring of the UnifiedDataGridToolbar component. Understanding these decisions will help you make informed choices when implementing the refactored toolbar.

## 1. Component Decomposition Strategy

### Decision: Break down the toolbar into logical sections and individual components

The original UnifiedDataGridToolbar was a monolithic component with multiple responsibilities. We decided to break it down into smaller, more focused components:

- **Main Container**: `DataGridToolbar`
- **Sections**: `DataGridToolbarLeft` and `DataGridToolbarRight`
- **Individual Components**: Buttons and status indicators

**Rationale:**
- **Single Responsibility Principle**: Each component has a single, well-defined responsibility.
- **Improved Maintainability**: Smaller components are easier to understand, test, and maintain.
- **Enhanced Reusability**: Individual components can be reused in different contexts.
- **Better Testability**: Smaller components with clear responsibilities are easier to test.

## 2. Context Integration

### Decision: Maintain direct integration with GridModeContext and GridFormContext

The toolbar components continue to use the GridModeContext and GridFormContext directly, rather than passing all state and functions through props.

**Rationale:**
- **Reduced Prop Drilling**: Avoids passing numerous props through multiple component layers.
- **Consistent State Access**: All components have access to the same state and functions.
- **Simplified API**: Components have a cleaner API without numerous props.
- **Backward Compatibility**: Maintains compatibility with the existing context structure.

**Trade-offs:**
- **Context Dependency**: Components are tightly coupled to the specific contexts.
- **Testing Complexity**: Testing requires mocking the contexts.

## 3. Customization Approach

### Decision: Provide multiple levels of customization

We designed the toolbar to support multiple levels of customization:

1. **Prop-Based Customization**: Hide/show specific components via props (e.g., `hideAddButton`, `hideFilterButton`).
2. **Component Replacement**: Replace entire sections with custom components (e.g., `leftSection`, `rightSection`).
3. **Individual Component Replacement**: Replace individual buttons with custom components (e.g., `customFilterButton`).
4. **Headless UI**: Use hooks to build completely custom UI (Phase 2).

**Rationale:**
- **Flexibility**: Accommodates different customization needs.
- **Progressive Complexity**: Simple customizations are easy, complex customizations are possible.
- **Backward Compatibility**: Existing code can continue to work with minimal changes.
- **Future-Proofing**: The headless approach allows for complete UI customization.

## 4. Button Behavior

### Decision: Make buttons self-contained with their own state management

Each button component manages its own state and behavior, including:
- Determining when it should be disabled
- Handling its own click events
- Displaying appropriate tooltips

**Rationale:**
- **Encapsulation**: Buttons encapsulate their own behavior and state.
- **Reusability**: Buttons can be used independently of the toolbar.
- **Consistency**: Buttons behave consistently across different contexts.
- **Simplified Maintenance**: Changes to button behavior are localized to the button component.

## 5. Dialog Management

### Decision: Keep dialogs within their respective components

Dialogs (filter dialog, help dialog, validation errors dialog) are managed within their respective components rather than being lifted to a higher level.

**Rationale:**
- **Encapsulation**: Components manage their own UI state.
- **Reduced Prop Drilling**: Avoids passing dialog state through multiple components.
- **Simplified API**: Components have a cleaner API without numerous dialog-related props.
- **Localized State**: Dialog state is kept close to where it's used.

**Trade-offs:**
- **Limited Control**: Parent components have limited control over dialog behavior.
- **Potential Duplication**: Multiple instances of the same component might create multiple dialogs.

## 6. Phased Implementation

### Decision: Implement the refactoring in two phases

1. **Phase 1**: Component Decomposition
2. **Phase 2**: Headless UI Layer

**Rationale:**
- **Manageable Scope**: Breaking the work into phases makes it more manageable.
- **Incremental Value**: Phase 1 provides immediate value with improved composability.
- **Risk Mitigation**: Issues can be identified and addressed before moving to Phase 2.
- **Backward Compatibility**: Phase 1 maintains compatibility with existing code.

## 7. Naming Conventions

### Decision: Use clear, descriptive names for components and props

- Component names clearly indicate their purpose (e.g., `DataGridToolbarLeft`, `AddRowButton`).
- Prop names follow a consistent pattern (e.g., `hideAddButton`, `customFilterButton`).
- Boolean props use positive language (e.g., `hideAddButton` instead of `showAddButton`).

**Rationale:**
- **Self-Documentation**: Names clearly indicate purpose and behavior.
- **Consistency**: Consistent naming patterns make the API easier to learn and use.
- **Readability**: Clear names improve code readability and maintainability.
- **Developer Experience**: Intuitive names reduce the learning curve.

## 8. Default Behavior

### Decision: Maintain current behavior by default

The refactored toolbar maintains the same behavior as the original UnifiedDataGridToolbar by default, with all components visible and functioning as before.

**Rationale:**
- **Backward Compatibility**: Existing code continues to work with minimal changes.
- **Reduced Migration Effort**: Users can adopt the new components incrementally.
- **Familiar Experience**: Users familiar with the original toolbar will find the new one familiar.
- **Gradual Adoption**: Users can gradually adopt new customization options.

## 9. Styling Approach

### Decision: Use Material-UI's styling system with consistent patterns

- Components use Material-UI's `sx` prop for styling.
- Common styles are extracted and reused.
- Components accept a `className` prop for external styling.

**Rationale:**
- **Consistency**: Consistent styling patterns across components.
- **Flexibility**: The `className` prop allows for external styling.
- **Maintainability**: Centralized styles are easier to maintain.
- **Performance**: Material-UI's styling system is optimized for performance.

## 10. Headless UI Design (Phase 2)

### Decision: Create hooks that mirror the component hierarchy

- Main hook: `useDataGridToolbar`
- Section hooks: `useDataGridToolbarLeft` and `useDataGridToolbarRight`
- Individual hooks: `useAddRow`, `useSaveChanges`, etc.

**Rationale:**
- **Familiar Structure**: The hook structure mirrors the component structure.
- **Granular Control**: Developers can use hooks at different levels of granularity.
- **Composition**: Hooks can be composed to create custom UI.
- **Separation of Concerns**: Logic is separated from presentation.

## Conclusion

These design decisions were made to create a more flexible, composable, and maintainable toolbar system while preserving backward compatibility. The phased approach allows for incremental adoption and risk mitigation.

When implementing the refactored toolbar, keep these decisions in mind to ensure consistency with the overall design philosophy. Feel free to revisit and adjust these decisions as needed based on your specific requirements and constraints.