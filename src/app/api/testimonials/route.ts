import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Testimonial } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const publicOnly = searchParams.get('public') === 'true';
    const withVideo = searchParams.get('withVideo') === 'true';
    const minRating = parseInt(searchParams.get('minRating') || '1');

    const where: any = {
      rating: {
        gte: minRating
      }
    };

    if (publicOnly) {
      where.isPublic = true;
    }

    if (withVideo) {
      where.videoUrl = {
        not: null
      };
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            id: true,
            occasionType: true,
            date: true,
            theme: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: [
        { videoUrl: 'desc' }, // Video testimonials first
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const total = await prisma.testimonial.count({ where });

    const formattedTestimonials: (Testimonial & { 
      customer?: { id: string; name: string; email: string };
      booking?: any;
    })[] = testimonials.map(testimonial => ({
      ...testimonial,
      customer: testimonial.customer,
      booking: testimonial.booking
    }));

    return NextResponse.json({
      success: true,
      data: {
        testimonials: formattedTestimonials,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_TESTIMONIALS_ERROR',
        message: 'Failed to fetch testimonials'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      bookingId,
      portfolioItemId,
      rating,
      comment,
      images = [],
      videoUrl,
      isPublic = true
    } = body;

    // Validate required fields
    if (!customerId || !bookingId || !rating || !comment) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: customerId, bookingId, rating, comment'
        },
        timestamp: new Date()
      }, { status: 400 });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 1 and 5'
        },
        timestamp: new Date()
      }, { status: 400 });
    }

    // Check if booking exists and belongs to customer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: customerId
      }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found or does not belong to customer'
        },
        timestamp: new Date()
      }, { status: 404 });
    }

    // Check if testimonial already exists for this booking
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: {
        bookingId: bookingId
      }
    });

    if (existingTestimonial) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TESTIMONIAL_EXISTS',
          message: 'Testimonial already exists for this booking'
        },
        timestamp: new Date()
      }, { status: 409 });
    }

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        customerId,
        bookingId,
        portfolioItemId,
        rating,
        comment,
        images,
        videoUrl,
        isPublic
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            id: true,
            occasionType: true,
            date: true,
            theme: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
      timestamp: new Date()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'CREATE_TESTIMONIAL_ERROR',
        message: 'Failed to create testimonial'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}