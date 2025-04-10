# Refactoring Plan: GraphQL DataGrid Helper Components

**Goal:** Move reusable logic from `demos/graphql/components/` into the core `components/DataGrid/` structure, remove the dependency on the `demos/` directory, and ensure clean APIs for the components used in `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx`.

**Analysis:**

*   **`EnhancedColumnConfig` Type:** Defined locally in `EnhancedDataGridGraphQLCustom.tsx`, needs centralization.
*   **`CellRendererWrapper`:** Bridges `CellRenderer` and `GridFormContext` (dirty status, errors, live form values). Generally useful for editable grids.
*   **`DataGridWithModeControl`:** Higher-level DataGrid integrating `GridModeContext`, handling edit initiation, and configuring server-side operations. Bundles reusable logic.
*   **`GridFormWrapper`:** Connects `GridFormContext` (save, cancel) with `GridModeProvider`. Glue code for form actions and grid modes.

**Refactoring Steps:**

1.  **Centralize Type Definitions:**
    *   Move `FieldConfig` and `EnhancedColumnConfig` type definitions from `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx` to `components/DataGrid/types/columnConfig.ts`.
    *   Update `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx` to import these types from the new location.

2.  **Relocate `CellRendererWrapper`:**
    *   Move `demos/graphql/components/CellRendererWrapper.tsx` to `components/DataGrid/renderers/FormAwareCellRenderer.tsx`.
    *   Update internal imports (`EnhancedColumnConfig` from `../types/columnConfig`, `useGridForm` from `../context/GridFormContext`, `CellRenderer` from `./CellRenderer`).
    *   Update `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx` to import and use `FormAwareCellRenderer` from `../../components/DataGrid/renderers/FormAwareCellRenderer`.

3.  **Relocate `GridFormWrapper`:**
    *   Move `demos/graphql/components/GridFormWrapper.tsx` to `components/DataGrid/components/GridFormModeConnector.tsx`.
    *   Update internal imports (`useGridForm` from `../context/GridFormContext`, `GridModeProvider` from `../context/GridModeContext`).
    *   Update `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx` to import and use `GridFormModeConnector` from `../../components/DataGrid/components/GridFormModeConnector`.

4.  **Integrate `DataGridWithModeControl` Logic:**
    *   Create a new core grid component: `components/DataGrid/CoreDataGrid.tsx`.
    *   Copy the implementation from `demos/graphql/components/DataGridWithModeControl.tsx` into this new file.
    *   Update internal imports (`EnhancedColumnConfig` from `../types/columnConfig`, `useGridMode` from `../context/GridModeContext`, etc.).
    *   Update `issuetracker/components/EnhancedDataGridGraphQLCustom.tsx` to import and use `CoreDataGrid` from `../../components/DataGrid/CoreDataGrid`.

5.  **Clean Up:**
    *   Delete the original files from `demos/graphql/components/`: `CellRendererWrapper.tsx`, `DataGridWithModeControl.tsx`, `GridFormWrapper.tsx`.
    *   (Optional Follow-up): Review `demos/graphql/components/EnhancedDataGridGraphQL.tsx` for potential simplification or removal.

**Diagram of Proposed Structure:**

```mermaid
graph TD
    subgraph issuetracker/components
        EnhancedDataGridGraphQLCustom.tsx
    end

    subgraph components/DataGrid
        CoreDataGrid.tsx --- GridModeContext
        CoreDataGrid.tsx --- columnConfig.ts

        subgraph components/DataGrid/renderers
            FormAwareCellRenderer.tsx --- GridFormContext
            FormAwareCellRenderer.tsx --- CellRenderer.tsx
            FormAwareCellRenderer.tsx --- columnConfig.ts
            EditCellRenderer.tsx
            CellRenderer.tsx
        end

        subgraph components/DataGrid/components
            GridFormModeConnector.tsx --- GridFormContext
            GridFormModeConnector.tsx --- GridModeProvider
            UnifiedDataGridToolbar.tsx
            ToolbarPagination.tsx
            CellEditHandler.tsx
            GlobalFilterDialog.tsx
            ...
        end

        subgraph components/DataGrid/context
            GridFormProvider --- GridFormContext
            GridModeProvider --- GridModeContext
            GridFormContext.tsx
            GridModeContext.tsx
            ...
        end

        subgraph components/DataGrid/types
            columnConfig.ts
            ...
        end

        subgraph components/DataGrid/hooks
             useGraphQLData.ts
             useGridNavigation.ts
             useSelectionModel.ts
             ...
        end
    end

    EnhancedDataGridGraphQLCustom.tsx --> GridFormProvider
    EnhancedDataGridGraphQLCustom.tsx --> GridFormModeConnector.tsx
    EnhancedDataGridGraphQLCustom.tsx --> CoreDataGrid.tsx
    EnhancedDataGridGraphQLCustom.tsx --> FormAwareCellRenderer.tsx
    EnhancedDataGridGraphQLCustom.tsx --> EditCellRenderer.tsx
    EnhancedDataGridGraphQLCustom.tsx --> columnConfig.ts
    EnhancedDataGridGraphQLCustom.tsx --> CellEditHandler.tsx
    EnhancedDataGridGraphQLCustom.tsx --> useGraphQLData.ts
    EnhancedDataGridGraphQLCustom.tsx --> useSelectionModel.ts
    EnhancedDataGridGraphQLCustom.tsx --> useGridNavigation.ts

    %% Removed Demo Dependencies
    style EnhancedDataGridGraphQLCustom.tsx stroke-dasharray: 5, 5, fill:#f9f,stroke:#333,stroke-width:0px %% Indicate this is the file being refactored

    subgraph demos/graphql/components [Removed]
        direction LR
        CellRenderer_Removed(CellRendererWrapper.tsx)
        DataGridWithModeControl_Removed(DataGridWithModeControl.tsx)
        GridFormWrapper_Removed(GridFormWrapper.tsx)
    end
    style demos/graphql/components fill:#ddd,stroke:#999,stroke-dasharray: 5 5