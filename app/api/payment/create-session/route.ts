import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, SERVICE_PRICE_CENTS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userCase = await prisma.case.findUnique({ where: { userId: session.user.id } });
  if (!userCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  const { locale } = await req.json().catch(() => ({ locale: 'en' }));
  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: SERVICE_PRICE_CENTS,
          product_data: {
            name: 'Revocable Living Trust Package',
            description:
              'Complete estate planning package: Trust, POA, AHCD, HIPAA Authorization, Pour-Over Will, Certificate of Trust',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/${locale}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/dashboard/payment`,
    metadata: { caseId: userCase.id, userId: session.user.id },
    customer_email: session.user.email ?? undefined,
  });

  await prisma.payment.upsert({
    where: { caseId: userCase.id },
    create: {
      caseId: userCase.id,
      stripeSessionId: stripeSession.id,
      amount: SERVICE_PRICE_CENTS,
      status: 'pending',
    },
    update: { stripeSessionId: stripeSession.id, status: 'pending' },
  });

  await prisma.case.update({
    where: { id: userCase.id },
    data: { status: 'PAYMENT_PENDING' },
  });

  return NextResponse.json({ url: stripeSession.url });
}
