import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const caseId = session.metadata?.caseId;
    if (!caseId) return NextResponse.json({ received: true });

    await prisma.payment.update({
      where: { caseId },
      data: {
        stripePaymentId: session.payment_intent as string,
        status: 'paid',
        paidAt: new Date(),
      },
    });

    await prisma.case.update({
      where: { id: caseId },
      data: { status: 'PAYMENT_COMPLETE' },
    });
  }

  return NextResponse.json({ received: true });
}
