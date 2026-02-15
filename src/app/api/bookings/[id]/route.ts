
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APIResponse, Booking } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'INVALID_ID',
                    message: 'Booking ID is required'
                },
                timestamp: new Date()
            } as APIResponse<null>, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                theme: true,
                addons: {
                    include: {
                        addon: true
                    }
                },
                payments: true
            }
        });

        if (!booking) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'BOOKING_NOT_FOUND',
                    message: 'Booking not found'
                },
                timestamp: new Date()
            } as APIResponse<null>, { status: 404 });
        }

        // TODO: Verify user ownership (Authorization)
        // For now, we assume the frontend sends the correct ID and verify via session if available in future steps

        return NextResponse.json({
            success: true,
            data: booking as unknown as Booking,
            timestamp: new Date()
        } as APIResponse<Booking>, { status: 200 });

    } catch (error) {
        console.error('Booking fetch error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch booking details'
            },
            timestamp: new Date()
        } as APIResponse<null>, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status, note } = body;

        // Basic validation
        if (!status) {
            return NextResponse.json({
                success: false,
                error: { code: 'INVALID_DATA', message: 'Status is required' }
            }, { status: 400 });
        }

        // Fetch current booking to append history
        const currentBooking = await prisma.booking.findUnique({
            where: { id },
            select: { statusHistory: true }
        });

        if (!currentBooking) {
            return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } }, { status: 404 });
        }

        const historyEntry = {
            status,
            timestamp: new Date().toISOString(),
            note: note || 'Status updated via API'
        };

        let newHistory = [];
        if (currentBooking.statusHistory && Array.isArray(currentBooking.statusHistory)) {
            newHistory = [...(currentBooking.statusHistory as any[]), historyEntry];
        } else {
            newHistory = [historyEntry];
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status,
                statusHistory: newHistory
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedBooking,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Booking update error:', error);
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update booking' }
        }, { status: 500 });
    }
}
