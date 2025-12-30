import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingData, APIResponse, Booking } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();
    console.log('📦 Received booking data:', JSON.stringify(bookingData, null, 2));

    // Validate required fields
    if (!bookingData.occasionType || !bookingData.themeId || !bookingData.date ||
      !bookingData.timeSlot || !bookingData.location || !bookingData.customerInfo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required booking information'
        },
        timestamp: new Date()
      } as APIResponse<null>, { status: 400 });
    }

    // Check if theme exists and is active
    const theme = await prisma.theme.findFirst({
      where: {
        id: bookingData.themeId,
        isActive: true
      }
    });

    if (!theme) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'THEME_NOT_FOUND',
          message: 'Selected theme is not available'
        },
        timestamp: new Date()
      } as APIResponse<null>, { status: 404 });
    }

    // Check for existing bookings at the same date/time/location
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingData.date,
        startTime: bookingData.timeSlot.startTime,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (existingBooking) {
      // DEV MODE: Bypass availability check if enabled
      if (process.env.NEXT_PUBLIC_ENABLE_ALL_SLOTS !== 'true') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'Selected time slot is no longer available'
          },
          timestamp: new Date()
        } as APIResponse<null>, { status: 409 });
      } else {
        console.warn('⚠️ Bypassing slot availability check due to NEXT_PUBLIC_ENABLE_ALL_SLOTS=true');
      }
    }

    // Create or find customer
    let customer = await prisma.user.findFirst({
      where: {
        OR: [
          { email: bookingData.customerInfo.email },
          { phone: bookingData.customerInfo.phone }
        ]
      }
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.user.create({
        data: {
          name: bookingData.customerInfo.name,
          email: bookingData.customerInfo.email,
          phone: bookingData.customerInfo.phone,
          role: 'CUSTOMER',
          password: '', // Will be set when they register
          isActive: true
        }
      });
    }

    // Calculate total amount (simplified - would use pricing service)
    const baseAmount = theme.basePrice * (bookingData.guestCount / 25);
    const locationSurcharge = baseAmount * 0.1; // 10% location surcharge
    const subtotal = baseAmount + locationSurcharge;
    const taxes = subtotal * 0.18; // 18% GST
    const totalAmount = Math.round(subtotal + taxes);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        occasionType: bookingData.occasionType,
        themeId: bookingData.themeId,
        date: bookingData.date,
        startTime: bookingData.timeSlot.startTime,
        endTime: bookingData.timeSlot.endTime,
        guestCount: bookingData.guestCount,
        totalAmount,
        location: JSON.parse(JSON.stringify(bookingData.location)), // JSON field
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        theme: true
      }
    });

    // TODO: Send confirmation email/WhatsApp message
    // TODO: Trigger notification to admin/decorators

    return NextResponse.json({
      success: true,
      data: booking as unknown as Booking,
      timestamp: new Date()
    } as APIResponse<Booking>, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create booking'
      },
      timestamp: new Date()
    } as APIResponse<null>, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        theme: true,
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.booking.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      } as Record<string, unknown>,
      timestamp: new Date()
    } as APIResponse<Record<string, unknown>>, { status: 200 });

  } catch (error) {
    console.error('Bookings fetch error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch bookings'
      },
      timestamp: new Date()
    } as APIResponse<null>, { status: 500 });
  }
}