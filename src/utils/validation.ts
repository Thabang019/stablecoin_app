import { LoginForm, SignUpForm, SendMoneyForm, CollaborativePaymentForm } from '../types/api';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Amount validation
export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M for safety
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validation errors
export interface ValidationError {
  field: string;
  message: string;
}

// Login form validation
export const validateLoginForm = (form: LoginForm): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!form.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(form.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!form.password.trim()) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

// Sign up form validation
export const validateSignUpForm = (form: SignUpForm): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!form.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (form.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!form.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (form.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  if (!form.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(form.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!form.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(form.password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
    });
  }

  if (form.password !== form.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
};

// Send money form validation
export const validateSendMoneyForm = (form: SendMoneyForm): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!form.recipientEmail.trim()) {
    errors.push({ field: 'recipientEmail', message: 'Recipient email is required' });
  } else if (!isValidEmail(form.recipientEmail)) {
    errors.push({ field: 'recipientEmail', message: 'Please enter a valid recipient email' });
  }

  if (!form.amount.trim()) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (!isValidAmount(form.amount)) {
    errors.push({ field: 'amount', message: 'Please enter a valid amount between 0.01 and 1,000,000' });
  }

  return errors;
};

// Collaborative payment form validation
export const validateCollaborativeForm = (form: CollaborativePaymentForm): ValidationError[] => {
  const errors = validateSendMoneyForm(form);

  if (!form.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required for collaborative payments' });
  } else if (form.description.trim().length < 5) {
    errors.push({ field: 'description', message: 'Description must be at least 5 characters' });
  }

  if (form.splitType === 'EQUAL') {
    if (!form.maxParticipants?.trim()) {
      errors.push({ field: 'maxParticipants', message: 'Number of participants is required for equal splits' });
    } else {
      const participants = parseInt(form.maxParticipants);
      if (isNaN(participants) || participants < 2 || participants > 100) {
        errors.push({ field: 'maxParticipants', message: 'Participants must be between 2 and 100' });
      }
    }
  }

  return errors;
};