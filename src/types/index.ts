// Core Types for BashItNow Application
// These types match the Prisma schema models

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'DECORATOR';
export type EventCategory = 'BIRTHDAY' | 'ANNIVERSARY' | 'BABY_SHOWER' | 'CORPORATE' | 'OTHER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  [key: string]: unknown; // Allow additional properties for JSON compatibility
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;
  isAvailable: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  images: string[];
  videoUrl?: string;
  basePrice: number;
  setupTime: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  customerId: string;
  occasionType: string;
  themeId: string;
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  decoratorId?: string;
  specialRequests?: string;
  location: Location; // JSON field in database
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  themeId: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImages: string[];
  videoUrl?: string;
  eventDate: Date;
  location: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  customerId: string;
  bookingId: string;
  portfolioItemId?: string;
  rating: number;
  comment: string;
  images: string[];
  videoUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingAddon {
  id: string;
  bookingId: string;
  addonId: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  gatewayPaymentId?: string;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceBreakdown {
  basePrice: number;
  addonPrices: { [addonId: string]: number };
  locationSurcharge: number;
  guestCountMultiplier: number;
  totalPrice: number;
  taxes: number;
  finalAmount: number;
}

// Form Types
export interface QuickBookingData {
  date: string;
  occasion: string;
  location: string;
  budgetRange: string;
}

export interface BudgetRange {
  min: number;
  max: number;
}

export interface BookingData {
  occasionType: string;
  themeId: string;
  date: Date;
  timeSlot: TimeSlot;
  location: Location;
  guestCount: number;
  budgetRange: { min: number; max: number };
  addons: string[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: Date;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}