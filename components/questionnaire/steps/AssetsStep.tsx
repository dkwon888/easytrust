'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Building2, TrendingUp, Car, Briefcase, Package } from 'lucide-react';

const assetFields = [
  { key: 'realEstate', icon: Home },
  { key: 'bankAccounts', icon: Building2 },
  { key: 'investment', icon: TrendingUp },
  { key: 'vehicles', icon: Car },
  { key: 'business', icon: Briefcase },
  { key: 'other', icon: Package },
] as const;

export default function AssetsStep() {
  const t = useTranslations('questionnaire.assets');
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('help')}</p>
      </div>

      <div className="space-y-4">
        {assetFields.map(({ key, icon: Icon }) => (
          <div key={key} className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-navy-600" />
              {t(key as Parameters<typeof t>[0])}
            </Label>
            <Textarea
              rows={2}
              placeholder="List items here..."
              {...register(`assets.${key}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
