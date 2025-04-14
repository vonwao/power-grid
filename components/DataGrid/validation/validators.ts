import { FieldValidator, ValidationResult, ValidationRule } from './types';
import { RequiredRule } from './rules';
import { FieldTypeConfig } from '../fieldTypes/types';
import { EnhancedColumnConfig } from '../EnhancedDataGridGraphQL';

export function createValidator<T>(rules: ValidationRule<T>[]): FieldValidator<T> {
  return {
    rules,
    validate(value: T | null): ValidationResult {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          return { valid: false, message: rule.getMessage() };
        }
      }
      return { valid: true };
    }
  };
}

// Helper to create a validator from column config
export function createValidatorFromColumnConfig<T>(
  column: EnhancedColumnConfig<T>
): FieldValidator<T> {
  const rules: ValidationRule<T>[] = [
    // Add required rule if specified
    ...(column.required ? [new RequiredRule<T>()] : []),
    // Add default rules from field type
    ...column.fieldType.getDefaultValidationRules(),
    // Add custom rules if specified
    ...(column.validationRules || []),
  ];
  
  return createValidator(rules);
}
