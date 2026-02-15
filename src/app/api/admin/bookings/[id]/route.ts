import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
            description: true,
            basePrice: true,
          },
        },
        decorator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        addons: {
          include: {
            addon: true,
          },
        },
        payments: true,
        testimonial: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Admin booking fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch booking' } },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    // Allow ADMIN or DECORATOR (for status updates)
    if (!userRole || !['ADMIN', 'DECORATOR'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Authorized access required' } },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, paymentStatus, decoratorId, specialRequests, proofOfWorkUrl, addons } = body;

    // Fetch current booking to validate transition
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      select: {
        status: true,
        proofOfWorkUrl: true,
        theme: { select: { basePrice: true } }
      }
    });

    if (!currentBooking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }

    // Status Transition Logic
    if (status) {
      // DECORATOR specific checks
      if (userRole === 'DECORATOR') {
        if (status === 'COMPLETED') {
          // MUST have proof of work (either in body or already saved)
          const hasProof = proofOfWorkUrl || currentBooking.proofOfWorkUrl;
          if (!hasProof) {
            return NextResponse.json(
              { success: false, error: { code: 'VALIDATION_ERROR', message: 'Proof of work is required to complete a job.' } },
              { status: 400 }
            );
          }
        }
        // Decorators cannot cancel
        if (status === 'CANCELLED') {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: 'Decorators cannot cancel bookings.' } },
            { status: 403 }
          );
        }
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (decoratorId !== undefined) updateData.decoratorId = decoratorId;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (proofOfWorkUrl) updateData.proofOfWorkUrl = proofOfWorkUrl;
    if (status === 'COMPLETED' && !currentBooking.status.includes('COMPLETED')) {
      updateData.completedAt = new Date();
    }

    // Handle Addon Updates
    if (addons && Array.isArray(addons)) {
      // 1. Calculate new Total Amount
      let addonsTotal = 0;

      // Fetch current prices for the addons to be safe, or assume passed from frontend (risky but okay for admin)
      // For correctness, let's fetch.
      const addonIds = addons.map((a: any) => a.addonId);
      const dbAddons = await prisma.addon.findMany({ where: { id: { in: addonIds } } });
      const addonMap = new Map(dbAddons.map(a => [a.id, a]));

      addons.forEach((a: any) => {
        const dbAddon = addonMap.get(a.addonId);
        if (dbAddon) {
          addonsTotal += dbAddon.price * (a.quantity || 1);
        }
      });

      updateData.totalAmount = currentBooking.theme.basePrice + addonsTotal;

      // 2. Prepare Transaction for Addons
      updateData.addons = {
        deleteMany: {}, // Clear existing
        create: addons.map((a: any) => {
          const dbAddon = addonMap.get(a.addonId);
          return {
            addon: { connect: { id: a.addonId } },
            quantity: a.quantity || 1,
            price: dbAddon ? dbAddon.price : 0 // Snapshot price
          };
        })
      };
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
            basePrice: true,
          },
        },
        decorator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        addons: {
          include: {
            addon: true
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update booking' } },
      { status: 500 }
    );
  }
}