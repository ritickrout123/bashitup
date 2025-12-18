import { Testimonial } from '@/types';

export interface TestimonialFilters {
  limit?: number;
  offset?: number;
  publicOnly?: boolean;
  withVideo?: boolean;
  minRating?: number;
}

export interface SocialProofStats {
  totalClients: number;
  totalEvents: number;
  averageRating: number;
  totalReviews: number;
  yearsInBusiness: number;
  citiesServed: number;
  setupTime: number;
  satisfactionRate: number;
  recentBookings: {
    count: number;
    timeframe: string;
  };
}

export interface CreateTestimonialData {
  customerId: string;
  bookingId: string;
  portfolioItemId?: string;
  rating: number;
  comment: string;
  images?: string[];
  videoUrl?: string;
  isPublic?: boolean;
}

class TestimonialsService {
  private baseUrl = '/api';

  async getTestimonials(filters: TestimonialFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.publicOnly) params.append('public', 'true');
    if (filters.withVideo) params.append('withVideo', 'true');
    if (filters.minRating) params.append('minRating', filters.minRating.toString());

    const response = await fetch(`${this.baseUrl}/testimonials?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch testimonials');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch testimonials');
    }

    return result.data;
  }

  async createTestimonial(data: CreateTestimonialData) {
    const response = await fetch(`${this.baseUrl}/testimonials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create testimonial');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create testimonial');
    }

    return result.data;
  }

  async getSocialProofStats(): Promise<SocialProofStats> {
    const response = await fetch(`${this.baseUrl}/social-proof`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch social proof stats');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch social proof stats');
    }

    return result.data;
  }

  async updateSystemConfig(key: string, value: string | number) {
    const response = await fetch(`${this.baseUrl}/social-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
      throw new Error('Failed to update system config');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update system config');
    }

    return result.data;
  }

  // Mock data for development/testing
  getMockTestimonials(): Testimonial[] {
    return [
      {
        id: '1',
        customerId: 'customer-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Absolutely amazing service! The team transformed our living room into a magical birthday wonderland in just 45 minutes. My daughter was over the moon!',
        images: [
          '/images/testimonials/birthday-1-before.jpg',
          '/images/testimonials/birthday-1-after.jpg',
          '/images/testimonials/birthday-1-celebration.jpg'
        ],
        videoUrl: '/videos/testimonials/birthday-testimonial-1.mp4',
        isPublic: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        customerId: 'customer-2',
        bookingId: 'booking-2',
        rating: 5,
        comment: 'Professional, punctual, and absolutely creative! They made our anniversary celebration unforgettable. Highly recommend BashItNow!',
        images: [
          '/images/testimonials/anniversary-1-setup.jpg',
          '/images/testimonials/anniversary-1-couple.jpg'
        ],
        isPublic: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        customerId: 'customer-3',
        bookingId: 'booking-3',
        rating: 4,
        comment: 'Great service and beautiful decorations. The setup was quick and the team was very friendly. Will definitely book again!',
        images: [
          '/images/testimonials/baby-shower-1.jpg'
        ],
        videoUrl: '/videos/testimonials/baby-shower-testimonial-1.mp4',
        isPublic: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      }
    ];
  }

  getMockSocialProofStats(): SocialProofStats {
    return {
      totalClients: 2500,
      totalEvents: 3200,
      averageRating: 4.8,
      totalReviews: 1850,
      yearsInBusiness: 3,
      citiesServed: 12,
      setupTime: 60,
      satisfactionRate: 96,
      recentBookings: {
        count: 15,
        timeframe: '24 hours'
      }
    };
  }

  // Mock reviews data for ReviewsDisplay component
  getMockReviews() {
    return [
      {
        id: '1',
        platform: 'google' as const,
        customerName: 'Priya Sharma',
        rating: 5,
        comment: 'Exceptional service! They decorated our home for my son\'s birthday in under an hour. The balloon arch was stunning!',
        date: '2024-01-20',
        screenshot: '/images/reviews/google-review-1.jpg',
        verified: true
      },
      {
        id: '2',
        platform: 'whatsapp' as const,
        customerName: 'Rajesh Kumar',
        rating: 5,
        comment: 'Amazing team! Very professional and creative. Our anniversary setup was perfect. Thank you BashItNow! 🎉',
        date: '2024-01-18',
        screenshot: '/images/reviews/whatsapp-review-1.jpg',
        verified: true
      },
      {
        id: '3',
        platform: 'instagram' as const,
        customerName: 'Sneha Patel',
        rating: 4,
        comment: 'Beautiful decorations and quick setup. The team was very friendly and accommodating. Highly recommend! ✨',
        date: '2024-01-15',
        screenshot: '/images/reviews/instagram-review-1.jpg',
        verified: true
      },
      {
        id: '4',
        platform: 'google' as const,
        customerName: 'Amit Gupta',
        rating: 5,
        comment: 'Outstanding service! They made our baby shower so special. The pink and gold theme was exactly what we wanted.',
        date: '2024-01-12',
        verified: true
      },
      {
        id: '5',
        platform: 'facebook' as const,
        customerName: 'Kavya Reddy',
        rating: 5,
        comment: 'BashItNow exceeded our expectations! The corporate event decoration was professional and elegant. Will book again!',
        date: '2024-01-10',
        verified: true
      }
    ];
  }
}

export const testimonialsService = new TestimonialsService();