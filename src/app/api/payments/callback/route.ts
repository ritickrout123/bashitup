import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, preferredCallTime, phoneNumber, notes } = await request.json();

    if (!bookingId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Booking ID and phone number are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await AuthService.verifyAccessToken(token);

    // Update booking with callback request
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
        customerId: decoded.userId,
      },
      data: {
        paymentStatus: 'PENDING',
        status: 'PENDING',
        callbackRequested: true,
        preferredCallTime: preferredCallTime ? new Date(preferredCallTime) : null,
        callbackNotes: notes,
      },
    });

    // Here you would typically integrate with a CRM or notification system
    // to alert the sales team about the callback request
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Callback scheduled successfully. Our team will contact you soon.',
    });
  } catch (error) {
    console.error('Callback scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule callback' },
      { status: 500 }
    );
  }
}