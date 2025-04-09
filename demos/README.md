# EnhancedDataGrid Demos

This directory contains a collection of demos showcasing different features and use cases of the EnhancedDataGrid component.

## Feature Matrix

| Feature                    | Basic | Advanced | CSV | GraphQL | Playground |
|---------------------------|:-----:|:--------:|:---:|:-------:|:----------:|
| Row CRUD                  |   ✓   |    ✓     |     |    ✓    |     ✓      |
| Form Validation           |       |    ✓     |     |    ✓    |     ✓      |
| Toolbar Customization     |   ✓   |    ✓     |     |         |     ✓      |
| Data Import/Export        |       |    ✓     |  ✓  |         |            |
| Server Integration        |       |          |     |    ✓    |            |
| Custom Cell Rendering     |       |    ✓     |     |    ✓    |     ✓      |
| Selection Management      |   ✓   |    ✓     |     |    ✓    |     ✓      |
| Filtering & Sorting       |       |    ✓     |     |    ✓    |     ✓      |
| Headless Hooks           |   ✓   |    ✓     |     |         |     ✓      |

## Demo Descriptions

### Basic Demo
A minimal implementation showing core features:
- Basic row operations (add, edit, delete)
- Simple toolbar with essential actions
- Row selection
- Clean, focused example for getting started

### Advanced Demo
Full-featured implementation demonstrating:
- Complex form validation
- Custom cell rendering
- Advanced toolbar features
- Filtering and sorting
- Export capabilities
- Complete CRUD operations

### CSV Demo
Focused on data import/export:
- CSV file import with validation
- Data type mapping
- Error handling
- Export to CSV

### GraphQL Demo
Shows integration with a GraphQL backend:
- Server-side operations
- Custom cell renderers for GraphQL data
- Optimistic updates
- Error handling
- Real-time updates

### Interactive Playground
A sandbox environment for experimenting with:
- Custom toolbar configurations
- Different validation rules
- Various cell renderers
- Hook composition
- Live code editing

## Roadmap

### Planned Demos

1. **Real-time Collaboration Demo**
   - WebSocket integration
   - Conflict resolution
   - User presence
   - Change tracking

2. **Master-Detail Demo**
   - Nested grids
   - Related data handling
   - Drill-down navigation
   - Parent-child relationships

3. **Advanced Filtering Demo**
   - Custom filter components
   - Filter persistence
   - Complex filter logic
   - Filter presets

4. **Infinite Scroll Demo**
   - Virtual scrolling
   - Dynamic data loading
   - Scroll position management
   - Cache management

5. **Custom Editor Demo**
   - Rich text editing
   - Date/time pickers
   - Multi-select components
   - Custom validation

### Improvements to Existing Demos

1. **Basic Demo**
   - Add more documentation
   - Include common use cases
   - Improve error handling examples

2. **Advanced Demo**
   - Add more complex validation scenarios
   - Include batch operations
   - Add keyboard navigation examples

3. **GraphQL Demo**
   - Add subscription examples
   - Include caching strategies
   - Show optimistic update patterns

4. **CSV Demo**
   - Add more data transformation examples
   - Include custom mapping UI
   - Add validation configuration

## Contributing

Each demo is self-contained in its own directory. To add a new demo:

1. Create a new directory under `/demos`
2. Include any demo-specific components in a `components` subdirectory
3. Update this README's feature matrix
4. Add appropriate tests
5. Update the demo index page

Please ensure your demo:
- Focuses on a specific use case or feature set
- Includes proper documentation
- Follows the project's coding standards
- Has minimal overlap with existing demos
