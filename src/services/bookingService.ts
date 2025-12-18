import { BookingData, TimeSlot, APIResponse, Booking } from '@/types';

export class BookingService {
  private static baseUrl = '/api/bookings';

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingData): Promise<Booking> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result: APIResponse<Booking> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create booking');
    }

    return result.data!;
  }

  /**
   * Check availability for a specific date and location
   */
  static async checkAvailability(
    date: Date,
    city?: string,
    pincode?: string
  ): Promise<{
    date: string;
    location: { city?: string; pincode?: string };
    slots: TimeSlot[];
    metadata: {
      totalSlots: number;
      availableSlots: number;
      isWeekend: boolean;
      isSameDay: boolean;
    };
  }> {
    const params = new URLSearchParams({
      date: date.toISOString().split('T')[0],
    });

    if (city) params.append('city', city);
    if (pincode) params.append('pincode', pincode);

    const response = await fetch(`${this.baseUrl}/availability?${params.toString()}`);
    const result: APIResponse<Record<string, unknown>> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to check availability');
    }

    return result.data as {
      date: string;
      location: { city?: string; pincode?: string };
      slots: TimeSlot[];
      metadata: {
        totalSlots: number;
        availableSlots: number;
        isWeekend: boolean;
        isSameDay: boolean;
      };
    };
  }

  /**
   * Get bookings for a customer
   */
  static async getCustomerBookings(
    customerId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    bookings: Booking[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams({
      customerId,
    });

    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    const result: APIResponse<Record<string, unknown>> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch bookings');
    }

    return result.data as {
      bookings: Booking[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    };
  }

  /**
   * Get a specific booking by ID
   */
  static async getBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/${bookingId}`);
    const result: APIResponse<Booking> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch booking');
    }

    return result.data!;
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const result: APIResponse<Booking> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update booking');
    }

    return result.data!;
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const response = await fetch(`${this.baseUrl}/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    const result: APIResponse<Booking> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to cancel booking');
    }

    return result.data!;
  }

  /**
   * Get available themes
   */
  static async getAvailableThemes(category?: string): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);

    const response = await fetch(`/api/themes?${params.toString()}`);
    const result: APIResponse<Record<string, unknown>[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch themes');
    }

    return result.data as Record<string, unknown>[];
  }

  /**
   * Validate booking data before submission
   */
  static validateBookingData(bookingData: BookingData): {
    isValid: boolean;
    errors: { field: string; message: string }[];
  } {
    const errors: { field: string; message: string }[] = [];

    // Required field validation
    if (!bookingData.occasionType) {
      errors.push({ field: 'occasionType', message: 'Occasion type is required' });
    }

    if (!bookingData.themeId) {
      errors.push({ field: 'themeId', message: 'Theme selection is required' });
    }

    if (!bookingData.date) {
      errors.push({ field: 'date', message: 'Event date is required' });
    } else {
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingData.date < today) {
        errors.push({ field: 'date', message: 'Event date must be in the future' });
      }
    }

    if (!bookingData.timeSlot) {
      errors.push({ field: 'timeSlot', message: 'Time slot is required' });
    }

    if (!bookingData.location.address) {
      errors.push({ field: 'location.address', message: 'Venue address is required' });
    }

    if (!bookingData.location.city) {
      errors.push({ field: 'location.city', message: 'City is required' });
    }

    if (!bookingData.location.pincode) {
      errors.push({ field: 'location.pincode', message: 'Pincode is required' });
    }

    if (bookingData.guestCount < 1) {
      errors.push({ field: 'guestCount', message: 'Guest count must be at least 1' });
    }

    if (!bookingData.customerInfo.name) {
      errors.push({ field: 'customerInfo.name', message: 'Name is required' });
    }

    if (!bookingData.customerInfo.email) {
      errors.push({ field: 'customerInfo.email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(bookingData.customerInfo.email)) {
      errors.push({ field: 'customerInfo.email', message: 'Invalid email format' });
    }

    if (!bookingData.customerInfo.phone) {
      errors.push({ field: 'customerInfo.phone', message: 'Phone number is required' });
    } else if (!/^\+?[\d\s-()]{10,}$/.test(bookingData.customerInfo.phone)) {
      errors.push({ field: 'customerInfo.phone', message: 'Invalid phone number format' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format booking data for display
   */
  static formatBookingForDisplay(booking: Record<string, unknown>) {
    return {
      ...booking,
      formattedDate: new Date(booking.date as string).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedTime: `${booking.startTime} - ${booking.endTime}`,
      formattedAmount: `₹${(booking.totalAmount as number).toLocaleString('en-IN')}`,
      statusColor: this.getStatusColor(booking.status as string),
      paymentStatusColor: this.getPaymentStatusColor(booking.paymentStatus as string)
    };
  }

  private static getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'CONFIRMED': return 'blue';
      case 'IN_PROGRESS': return 'purple';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  }

  private static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'PAID': return 'green';
      case 'FAILED': return 'red';
      case 'REFUNDED': return 'orange';
      default: return 'gray';
    }
  }
}