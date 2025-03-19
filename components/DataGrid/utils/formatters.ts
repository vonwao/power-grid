// Date formatters
export const formatDate = (date: Date | null): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString();
};

export const formatDateForInput = (date: Date | null): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Number formatters
export const formatNumber = (value: number | null): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export const formatCurrency = (value: number | null, currency = 'USD'): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

// Boolean formatters
export const formatBoolean = (value: boolean | null): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return value ? 'Yes' : 'No';
};

// String formatters
export const truncateString = (value: string | null, maxLength = 50): string => {
  if (!value) {
    return '';
  }
  
  if (value.length <= maxLength) {
    return value;
  }
  
  return `${value.substring(0, maxLength)}...`;
};
