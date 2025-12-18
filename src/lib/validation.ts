import { QuickBookingData } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Indian format)
const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function validateQuickBooking(data: QuickBookingData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate date
  if (!data.date) {
    errors.push({ field: 'date', message: 'Please select a date' });
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push({ field: 'date', message: 'Please select a future date' });
    }
    
    // Check if date is too far in the future (1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (selectedDate > oneYearFromNow) {
      errors.push({ field: 'date', message: 'Please select a date within the next year' });
    }
  }

  // Validate occasion
  if (!data.occasion) {
    errors.push({ field: 'occasion', message: 'Please select an occasion' });
  }

  // Validate location
  if (!data.location) {
    errors.push({ field: 'location', message: 'Please enter your location' });
  } else if (data.location.length < 3) {
    errors.push({ field: 'location', message: 'Please enter a valid location' });
  }

  // Validate budget range
  if (!data.budgetRange) {
    errors.push({ field: 'budgetRange', message: 'Please select a budget range' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
}

export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  return phone; // Return original if format is unclear
}

export function getValidationErrorMessage(field: string, errors: ValidationError[]): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}