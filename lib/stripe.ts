import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export const SERVICE_PRICE_CENTS = parseInt(
  process.env.SERVICE_PRICE_CENTS ?? '150000',
  10
);
