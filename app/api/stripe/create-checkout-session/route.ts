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
              description: 'One-time fee to publish your hackathon on HackerFlow. NO REFUNDS ALLOWED.',
            },
            unit_amount: parseInt(process.env.STRIPE_HACKATHON_PUBLICATION_FEE || '5000'), // RM 50.00
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
      payment_intent_data: {
        description: `Hackathon Publication Fee - ${hackathonTitle} - NO REFUNDS`,
      },
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
