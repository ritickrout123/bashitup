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

    // Calculate total amount using shared pricing logic
    const { calculateDetailedPrice } = await import('@/lib/pricing');

    // Determine budget range based on theme base price (similar to frontend logic)
    const estimatedBudget = theme.basePrice * (bookingData.guestCount / 25);
    let budgetRange = '5000-10000';
    if (estimatedBudget > 50000) budgetRange = '50000+';
    else if (estimatedBudget > 20000) budgetRange = '20000-50000';
    else if (estimatedBudget > 10000) budgetRange = '10000-20000';

    const priceBreakdown = calculateDetailedPrice({
      occasion: bookingData.occasionType as any,
      budgetRange,
      guestCount: bookingData.guestCount,
      location: bookingData.location.city,
      addons: bookingData.addons
    });

    // Override base price with actual theme price as done in frontend
    const themeBasePrice = theme.basePrice * (bookingData.guestCount / 25);
    const addonTotal = Object.values(priceBreakdown.addonPrices).reduce((sum, price) => sum + price, 0);
    const locationSurchargeRate = priceBreakdown.locationSurcharge / priceBreakdown.basePrice || 0;
    const locationSurcharge = themeBasePrice * locationSurchargeRate;
    const subtotal = themeBasePrice + addonTotal + locationSurcharge;
    const taxes = subtotal * 0.18;
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

    // Create Stripe Checkout Session
    let checkoutSession;
    try {
      const { stripe } = await import('@/lib/stripe');
      if (!stripe) {
        console.error('Stripe configuration missing. STRIPE_SECRET_KEY might be unset or invalid.');
        throw new Error('Stripe configuration missing');
      }

      // Get base URL for success/cancel redirects
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      console.log('Creating Stripe Checkout Session...');

      // Prepare image URL
      let validImages: string[] | undefined = undefined;
      try {
        const parsedImages = JSON.parse(theme.images);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          const firstImage = parsedImages[0];
          if (typeof firstImage === 'string') {
            if (firstImage.startsWith('http')) {
              validImages = [firstImage];
            } else if (firstImage.startsWith('/')) {
              // Convert relative URL to absolute
              validImages = [`${origin}${firstImage}`];
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse theme images for Stripe:', e);
      }

      // Calculate Token/Deposit Amount
      // Logic: 20% of total, min 500, max 2000 (replicating PaymentService.calculateTokenAmount)
      const tokenPercentage = 0.2;
      const minToken = 500;
      const maxToken = 2000;
      const calculatedToken = Math.round(totalAmount * tokenPercentage);
      const tokenAmount = Math.max(minToken, Math.min(maxToken, calculatedToken));

      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${theme.name} Booking - Advance Token`,
                description: `Deposit to confirm Event: ${bookingData.occasionType} on ${new Date(bookingData.date).toDateString()}. Total Amount: ₹${totalAmount}`,
                images: validImages,
              },
              unit_amount: tokenAmount * 100, // Amount in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking?canceled=true`,
        customer_email: bookingData.customerInfo.email,
        metadata: {
          bookingId: booking.id,
          customerId: customer.id,
          type: 'TOKEN_PAYMENT',
          fullAmount: totalAmount.toString()
        },
      });
      console.log('Stripe Session created:', checkoutSession.id);

    } catch (stripeError) {
      console.error('Stripe session creation failed:', stripeError);
      // Return error to client to debug
      return NextResponse.json({
        success: false,
        error: {
          code: 'STRIPE_ERROR',
          message: stripeError instanceof Error ? stripeError.message : 'Payment initialization failed',
          details: stripeError
        },
        timestamp: new Date()
      } as APIResponse<null>, { status: 500 });
    }

    // TODO: Send confirmation email/WhatsApp message
    // TODO: Trigger notification to admin/decorators

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      } as unknown as Booking,
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