import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { APIResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { session_id } = await request.json();

        if (!session_id) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'MISSING_SESSION_ID',
                    message: 'Session ID is required'
                }
            }, { status: 400 });
        }

        if (!stripe) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'STRIPE_NOT_CONFIGURED',
                    message: 'Stripe is not configured'
                }
            }, { status: 500 });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'INVALID_SESSION',
                    message: 'Invalid session ID'
                }
            }, { status: 404 });
        }

        // Check payment status
        if (session.payment_status === 'paid') {
            const bookingId = session.metadata?.bookingId;

            if (bookingId) {
                // Update booking status
                const booking = await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: 'PAID',
                        status: 'CONFIRMED',
                        paymentIntentId: session.payment_intent as string,
                        paidAmount: (session.amount_total || 0) / 100
                    },
                    include: {
                        theme: true
                    }
                });

                return NextResponse.json({
                    success: true,
                    data: booking
                });
            }
        }

        return NextResponse.json({
            success: false,
            error: {
                code: 'PAYMENT_NOT_COMPLETED',
                message: 'Payment was not completed'
            }
        }, { status: 400 });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to verify payment'
            }
        }, { status: 500 });
    }
}
