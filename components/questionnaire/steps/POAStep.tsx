'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const POW_KEYS = ['banking', 'realEstate', 'tax', 'business', 'gifts', 'trusts', 'litigation'] as const;

export default function POAStep() {
  const t = useTranslations('questionnaire.poa');
  const { register, watch, setValue } = useFormContext();
  const powers: string[] = watch('poa.powers') ?? [];

  function togglePower(key: string) {
    const current = powers ?? [];
    if (current.includes(key)) {
      setValue('poa.powers', current.filter((p: string) => p !== key));
    } else {
      setValue('poa.powers', [...current, key]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('help')}</p>
      </div>

      {/* Primary Agent */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-navy-700">{t('agent.label')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('agent.name')} *</Label>
            <Input {...register('poa.agent.name', { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('agent.relationship')} *</Label>
            <Input {...register('poa.agent.relationship', { required: true })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('agent.address')}</Label>
          <Input {...register('poa.agent.address')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('agent.phone')}</Label>
            <Input type="tel" {...register('poa.agent.phone')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('agent.email')}</Label>
            <Input type="email" {...register('poa.agent.email')} />
          </div>
        </div>
      </div>

      {/* Alternate Agent */}
      <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
        <h3 className="font-medium text-navy-700">{t('alternate.label')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('alternate.name')}</Label>
            <Input {...register('poa.alternate.name')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('alternate.relationship')}</Label>
            <Input {...register('poa.alternate.relationship')} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('alternate.address')}</Label>
            <Input {...register('poa.alternate.address')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('alternate.phone')}</Label>
            <Input type="tel" {...register('poa.alternate.phone')} />
          </div>
        </div>
      </div>

      {/* Powers */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-navy-700">{t('powers')}</h3>
          <p className="text-xs text-muted-foreground">{t('powersHelp')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {POW_KEYS.map((key) => (
            <div key={key} className="flex items-start gap-2">
              <Checkbox
                id={`power-${key}`}
                checked={powers.includes(key)}
                onCheckedChange={() => togglePower(key)}
              />
              <Label htmlFor={`power-${key}`} className="font-normal text-sm cursor-pointer leading-relaxed">
                {t(`powersList.${key}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
