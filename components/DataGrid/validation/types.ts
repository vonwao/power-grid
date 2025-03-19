export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T | null, options?: any) => boolean;
  getMessage: (options?: any) => string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface FieldValidator<T = any> {
  rules: ValidationRule<T>[];
  validate: (value: T | null) => ValidationResult;
}
