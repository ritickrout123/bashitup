import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (middleware should handle this)
    // Check for admin or decorator role
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'ADMIN' && userRole !== 'DECORATOR') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // If decorator, force filtering by their ID to ensure strict isolation
    if (userRole === 'DECORATOR') {
      const requestedDecoratorId = searchParams.get('decoratorId');
      if (requestedDecoratorId !== userId) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Access restricted to assigned tasks only.' } },
          { status: 403 }
        );
      }
    }
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (searchParams.get('decoratorId')) {
      where.decoratorId = searchParams.get('decoratorId');
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        theme: {
          select: {
            id: true,
            name: true,
          },
        },
        decorator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Sanitize data for Decorators
    if (userRole === 'DECORATOR') {
      const sanitizedBookings = bookings.map(b => {
        const { totalAmount, paymentStatus, paymentIntentId, paidAmount, payments, ...safeBooking } = b as any;
        return safeBooking;
      });

      return NextResponse.json({
        success: true,
        data: sanitizedBookings,
      });
    }

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}