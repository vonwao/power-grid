import { ValidationRule } from './types';

export class RequiredRule<T> implements ValidationRule<T> {
  name = 'required';
  
  validate(value: T | null): boolean {
    return value !== null && value !== undefined && value !== '';
  }
  
  getMessage(): string {
    return 'This field is required';
  }
}

export class PatternRule implements ValidationRule<string> {
  name = 'pattern';
  private pattern: RegExp;
  private customMessage?: string;
  
  constructor(pattern: RegExp, message?: string) {
    this.pattern = pattern;
    this.customMessage = message;
  }
  
  validate(value: string | null): boolean {
    if (value === null || value === undefined) return true;
    return this.pattern.test(value);
  }
  
  getMessage(): string {
    return this.customMessage || 'Value does not match the required pattern';
  }
}

export class MinRule implements ValidationRule<number> {
  name = 'min';
  private min: number;
  private customMessage?: string;
  
  constructor(min: number, message?: string) {
    this.min = min;
    this.customMessage = message;
  }
  
  validate(value: number | null): boolean {
    if (value === null || value === undefined) return true;
    return value >= this.min;
  }
  
  getMessage(): string {
    return this.customMessage || `Value must be at least ${this.min}`;
  }
}

export class MaxRule implements ValidationRule<number> {
  name = 'max';
  private max: number;
  private customMessage?: string;
  
  constructor(max: number, message?: string) {
    this.max = max;
    this.customMessage = message;
  }
  
  validate(value: number | null): boolean {
    if (value === null || value === undefined) return true;
    return value <= this.max;
  }
  
  getMessage(): string {
    return this.customMessage || `Value must be at most ${this.max}`;
  }
}

export class NumberTypeRule implements ValidationRule<number> {
  name = 'numberType';
  
  validate(value: number | null): boolean {
    if (value === null || value === undefined) return true;
    return typeof value === 'number' && !isNaN(value);
  }
  
  getMessage(): string {
    return 'Value must be a valid number';
  }
}

export class DateTypeRule implements ValidationRule<Date> {
  name = 'dateType';
  
  validate(value: Date | null): boolean {
    if (value === null || value === undefined) return true;
    return value instanceof Date && !isNaN(value.getTime());
  }
  
  getMessage(): string {
    return 'Value must be a valid date';
  }
}
