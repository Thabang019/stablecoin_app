// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  user: User;
  token?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: 'incoming' | 'outgoing' | 'pending';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  txType: string;
  method: string;
  value: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

// Balance Types
export interface TokenBalance {
  name: string;
  balance: string;
  symbol: string;
}

export interface UserBalance {
  tokens: TokenBalance[];
  totalValue?: number;
}

// Payment Types
export interface RecipientDetails {
  id: string;
  paymentIdentifier: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TransferPayload {
  transactionAmount: number;
  transactionRecipient: string;
  transactionNotes: string;
}

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

// Collaborative Payment Types
export interface Contribution {
  userId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  createdAt: string;
  notes?: string;
}

export interface CollaborativeRequest {
  id: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  description: string;
  merchantId: string;
  splitType: 'OPEN' | 'EQUAL';
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  expiryDate: string;
  contributions: Contribution[];
  contributorCount: number;
  canContribute: boolean;
  suggestedAmount: number;
  maxParticipants?: number;
}

export interface CreateRequestPayload {
  totalAmount: number;
  description: string;
  merchantId: string;
  splitType: 'OPEN' | 'EQUAL';
  maxParticipants?: number | null;
  expiryDate: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SendMoneyForm {
  recipientEmail: string;
  amount: string;
  currency: string;
  description?: string;
  notes?: string;
}

export interface CollaborativePaymentForm extends SendMoneyForm {
  splitType: 'OPEN' | 'EQUAL';
  maxParticipants?: string;
  expiryHours: string;
}