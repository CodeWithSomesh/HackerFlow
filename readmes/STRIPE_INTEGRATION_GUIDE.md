# Stripe Integration Guide for HackerFlow

## Overview
This guide will help you integrate Stripe Checkout for hackathon publication payments, replacing the current payment modal with a professional Stripe payment page.

---

## 📋 Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. Access to your project's environment variables

---

## 🔑 Step 1: Get Your Stripe API Keys

### 1.1 Sign Up / Log In to Stripe
- Go to https://dashboard.stripe.com/register
- Create an account or log in

### 1.2 Get Your API Keys
1. Navigate to **Developers** → **API keys** in the Stripe Dashboard
2. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Get Your Webhook Signing Secret (for later)
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

---

## 🔧 Step 2: Add Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (Test Mode - use these for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Hackathon Publication Fee (in cents - RM 50.00 = 5000 cents)
STRIPE_HACKATHON_PUBLICATION_FEE=5000
```

**Production values** (when you deploy):
- Use `pk_live_` and `sk_live_` keys instead
- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Create a new webhook endpoint with your production URL

---

## 📦 Step 3: Install Stripe Package

Run this command:

```bash
npm install stripe @stripe/stripe-js
```

---

## 🛠️ Step 4: Implementation Files

### File 1: Create Stripe Client Utility

**Location:** `lib/stripe/client.ts`

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};
```

---

### File 2: Create Stripe Server Utility

**Location:** `lib/stripe/server.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

---

### File 3: Create Checkout Session API Route

**Location:** `app/api/stripe/create-checkout-session/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { hackathonId, hackathonTitle } = await request.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Verify hackathon belongs to user
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, title, created_by')
      .eq('id', hackathonId)
      .eq('created_by', user.id)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'], // FPX for Malaysian banks
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: `Hackathon Publication Fee - ${hackathonTitle}`,
              description: 'One-time fee to publish your hackathon on HackerFlow. No refunds allowed.',
              images: ['https://yourdomain.com/logo.png'], // Add your logo URL
            },
            unit_amount: parseInt(process.env.STRIPE_HACKATHON_PUBLICATION_FEE || '5000'),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/organize/step3?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/organize/step3?payment=cancelled`,
      metadata: {
        hackathonId,
        userId: user.id,
        hackathonTitle,
      },
      customer_email: user.email,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

---

### File 4: Create Webhook Handler

**Location:** `app/api/stripe/webhook/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 Payment successful:', session.id);

      // Update hackathon payment status
      const supabase = await createClient();
      const hackathonId = session.metadata?.hackathonId;

      if (hackathonId) {
        const { error } = await supabase
          .from('hackathons')
          .update({
            payment_status: 'paid',
            payment_id: session.payment_intent as string,
            payment_amount: session.amount_total,
            paid_at: new Date().toISOString(),
          })
          .eq('id', hackathonId);

        if (error) {
          console.error('Error updating payment status:', error);
        } else {
          console.log('✅ Hackathon payment status updated');
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

---

### File 5: Update Step 3 Payment Button

In `app/organize/step3/page.tsx`, replace the payment modal with Stripe Checkout:

```typescript
// Add this function to handle Stripe payment
const handleStripePayment = async () => {
  if (!hackathonId) return;

  setIsPublishing(true);

  try {
    // Create Stripe Checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hackathonId,
        hackathonTitle: formData.title,
      }),
    });

    const { url, error } = await response.json();

    if (error) {
      showCustomToast('error', error);
      return;
    }

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Payment error:', error);
    showCustomToast('error', 'Failed to initialize payment');
  } finally {
    setIsPublishing(false);
  }
};

// Replace the publish button click handler
// Instead of: onClick={() => setShowPaymentModal(true)}
// Use: onClick={handleStripePayment}
```

---

### File 6: Handle Payment Success/Cancellation

Add this to your Step 3 page's `useEffect`:

```typescript
useEffect(() => {
  const sessionId = searchParams.get('session_id');
  const paymentStatus = searchParams.get('payment');

  if (paymentStatus === 'success' && sessionId) {
    // Payment successful - proceed to publish
    showCustomToast('success', 'Payment successful! Publishing hackathon...');
    handlePublish(); // Call your existing publish function
  } else if (paymentStatus === 'cancelled') {
    showCustomToast('info', 'Payment cancelled. You can try again when ready.');
  }
}, [searchParams]);
```

---

## 🗃️ Step 5: Database Migration

Add payment fields to your `hackathons` table:

```sql
-- Add payment tracking columns
ALTER TABLE hackathons
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_hackathons_payment_status
ON hackathons(payment_status);
```

---

## 🧪 Step 6: Testing

### Test Mode (Development)
1. Use test credit card: `4242 4242 4242 4242`
2. Any future expiry date (e.g., 12/34)
3. Any 3-digit CVC (e.g., 123)
4. Any 5-digit ZIP (e.g., 12345)

### Test FPX (Malaysian Banks)
1. Select any test bank
2. Follow the test flow
3. Choose "Success" or "Failure" scenario

---

## 🚀 Step 7: Go Live

1. Switch to **Live mode** in Stripe Dashboard
2. Update `.env` with live keys (`pk_live_`, `sk_live_`)
3. Create production webhook endpoint
4. Test thoroughly before launch

---

## 💡 Additional Features (Optional)

### Add "No Refund" Policy
In the checkout session creation, add:

```typescript
payment_intent_data: {
  description: 'Hackathon Publication Fee - NO REFUNDS',
},
```

### Send Receipt Email
Stripe automatically sends receipts! Configure in:
**Settings** → **Emails** → **Successful payments**

---

## 🆘 Troubleshooting

### Issue: "Invalid API Key"
- **Solution**: Check your `.env.local` file has correct keys
- Restart dev server after adding env variables

### Issue: Webhook not receiving events
- **Solution**: Use Stripe CLI for local testing:
  ```bash
  stripe listen --forward-to localhost:3001/api/stripe/webhook
  ```

### Issue: Payment succeeds but database not updated
- **Solution**: Check webhook logs in Stripe Dashboard
- Verify webhook secret is correct

---

## 📞 Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing

---

**Implementation Status:**
- ✅ Email notifications
- ⏳ Stripe integration (follow this guide)
- ⏳ Webhook setup (follow this guide)

**Estimated Time:** 2-3 hours for complete implementation
