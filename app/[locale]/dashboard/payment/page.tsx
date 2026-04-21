'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Lock, Shield } from 'lucide-react';

export default function PaymentPage() {
  const t = useTranslations('payment');
  const tFeatures = useTranslations('pricing');
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Unable to start checkout');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  const features = tFeatures.raw('features') as string[];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-navy-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Estate Planning Package</CardTitle>
            <div className="text-right">
              <div className="text-3xl font-bold">{t('amount')}</div>
              <div className="text-white/70 text-sm">one-time</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <p className="font-medium text-navy-700 mb-3">{t('what')}</p>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4">
            {error && (
              <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">{error}</p>
            )}
            <Button
              onClick={handleCheckout}
              size="xl"
              className="w-full bg-navy-700 hover:bg-navy-800 text-white"
              disabled={loading}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {loading ? 'Redirecting to payment...' : t('submit')}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{t('secure')}</span>
              <Shield className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
