// Type guards for various data types

// Check if a value is a string
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

// Check if a value is a number
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

// Check if a value is a boolean
export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

// Check if a value is a Date
export const isDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

// Check if a value is null or undefined
export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

// Check if a value is an array
export const isArray = <T = any>(value: any): value is Array<T> => {
  return Array.isArray(value);
};

// Check if a value is an object (not null, not array, not date)
export const isObject = (value: any): value is Record<string, any> => {
  return typeof value === 'object' && 
         value !== null && 
         !Array.isArray(value) && 
         !(value instanceof Date);
};

// Check if a value is empty (null, undefined, empty string, empty array, empty object)
export const isEmpty = (value: any): boolean => {
  if (isNullOrUndefined(value)) return true;
  if (isString(value)) return value.trim() === '';
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// Check if a value is a valid email
export const isEmail = (value: any): boolean => {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

// Check if a value is a valid URL
export const isUrl = (value: any): boolean => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
