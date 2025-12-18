import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;

        if (bookingId) {
          // Update booking status
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paymentIntentId: paymentIntent.id,
              paidAmount: paymentIntent.amount / 100, // Convert from cents
            },
          });

          // Create payment record
          await prisma.payment.create({
            data: {
              bookingId: bookingId,
              amount: paymentIntent.amount / 100,
              paymentMethod: 'card',
              paymentGateway: 'stripe',
              gatewayPaymentId: paymentIntent.id,
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          console.log(`Payment confirmed for booking ${bookingId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedBookingId = failedPayment.metadata.bookingId;

        if (failedBookingId) {
          await prisma.booking.update({
            where: { id: failedBookingId },
            data: {
              paymentStatus: 'FAILED',
            },
          });

          console.log(`Payment failed for booking ${failedBookingId}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}