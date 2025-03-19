/**
 * Custom form management types for DataGrid
 * 
 * These types replace the react-hook-form dependencies with our own
 * internal implementations while maintaining a familiar API.
 */

/**
 * Validation options for form fields
 * Mirrors react-hook-form's RegisterOptions but simplified for our needs
 */
export interface ValidationOptions {
  required?: string | boolean;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => string | boolean | Promise<string | boolean>;
}

/**
 * Field error representation
 * Mirrors react-hook-form's FieldError
 */
export interface FieldError {
  type: string;
  message?: string;
}

/**
 * Generic field values type
 * Mirrors react-hook-form's FieldValues
 */
export interface FieldValues {
  [key: string]: any;
}

/**
 * Field path type for type-safe field references
 * Mirrors react-hook-form's FieldPath
 */
export type FieldPath<TFieldValues extends FieldValues> = string;

/**
 * Form state representation
 * Simplified version of react-hook-form's FormState
 */
export interface FormState {
  values: Record<string, any>;
  errors: Record<string, FieldError>;
  dirtyFields: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
}

/**
 * Form methods for interacting with form state
 * Simplified version of react-hook-form's UseFormReturn
 */
export interface FormMethods {
  getValues: () => Record<string, any>;
  setValue: (name: string, value: any, options?: { shouldDirty?: boolean; shouldValidate?: boolean }) => void;
  setError: (name: string, error: { type: string; message: string }) => void;
  clearErrors: () => void;
  trigger: () => Promise<boolean>;
  formState: FormState;
}
