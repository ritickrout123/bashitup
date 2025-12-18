# Payment Integration

This module implements secure payment processing for the BashItNow booking system using Stripe.

## Components

### PaymentModal
Main component that provides payment options to users:
- **Pay Token Amount**: Secure card payment for booking confirmation
- **Schedule Callback**: Alternative option for users who prefer phone consultation

### PaymentComponent
Handles secure card payments using Stripe Elements:
- PCI-compliant payment form
- Real-time validation
- 3D Secure support
- Error handling and user feedback

### CallbackScheduler
Allows users to schedule a callback instead of immediate payment:
- Time slot selection
- Contact information collection
- Special requirements capture

### PaymentFeedback
Reusable component for displaying payment status messages:
- Success confirmations
- Error messages
- Information alerts

## API Endpoints

### POST /api/payments/create-intent
Creates a Stripe PaymentIntent for processing payments.

**Request:**
```json
{
  "amount": 1000,
  "bookingId": "booking_123"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /api/payments/confirm
Confirms payment completion and updates booking status.

**Request:**
```json
{
  "paymentIntentId": "pi_xxx",
  "bookingId": "booking_123"
}
```

### POST /api/payments/callback
Schedules a callback for users who prefer phone consultation.

**Request:**
```json
{
  "bookingId": "booking_123",
  "phoneNumber": "+919876543210",
  "preferredCallTime": "2024-01-15T14:00:00Z",
  "notes": "Prefer evening calls"
}
```

### POST /api/webhooks/stripe
Handles Stripe webhook events for payment status updates.

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Token Amount Calculation

The system calculates a token amount (advance payment) based on:
- 20% of total booking amount
- Minimum: ₹500
- Maximum: ₹2000

## Security Features

- PCI DSS compliant payment processing
- Webhook signature verification
- JWT-based authentication
- Input validation and sanitization
- HTTPS enforcement

## Usage Example

```tsx
import { PaymentModal } from '@/components/payment';

function BookingPage() {
  const [showPayment, setShowPayment] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowPayment(true)}>
        Proceed to Payment
      </button>
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        bookingData={{
          id: 'booking_123',
          totalAmount: 5000,
          customerPhone: '+919876543210',
          customerName: 'John Doe'
        }}
        onPaymentSuccess={(paymentId) => {
          console.log('Payment successful:', paymentId);
        }}
        onCallbackScheduled={(message) => {
          console.log('Callback scheduled:', message);
        }}
      />
    </div>
  );
}
```

## Testing

Run the payment service tests:
```bash
npm test src/components/payment/__tests__/PaymentService.test.ts
```

## Error Handling

The payment system includes comprehensive error handling for:
- Network failures
- Payment declines
- Invalid card details
- Authentication errors
- Server errors

All errors are logged and user-friendly messages are displayed to customers.