'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function PersonCard({ prefix, label, t }: { prefix: string; label: string; t: ReturnType<typeof useTranslations> }) {
  const { register } = useFormContext();
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium text-navy-700">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('name')} *</Label>
          <Input {...register(`${prefix}.name`, { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('relationship')} *</Label>
          <Input {...register(`${prefix}.relationship`, { required: true })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t('address')} *</Label>
        <Input {...register(`${prefix}.address`, { required: true })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('phone')}</Label>
          <Input type="tel" {...register(`${prefix}.phone`)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('email')}</Label>
          <Input type="email" {...register(`${prefix}.email`)} />
        </div>
      </div>
    </div>
  );
}

export default function TrustStructureStep() {
  const t = useTranslations('questionnaire.trust');
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="trustName">{t('trustName')}</Label>
        <Input
          id="trustName"
          placeholder="[Your Name] Revocable Living Trust"
          {...register('trust.trustName')}
        />
        <p className="text-xs text-muted-foreground">{t('trustNameHelp')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-navy-800 mb-1">{t('successorTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-3">{t('successorHelp')}</p>
        </div>
        <PersonCard
          prefix="trust.successorFirst"
          label={t('successorFirst.label')}
          t={useTranslations('questionnaire.trust.successorFirst')}
        />
        <PersonCard
          prefix="trust.successorSecond"
          label={t('successorSecond.label')}
          t={useTranslations('questionnaire.trust.successorSecond')}
        />
      </div>
    </div>
  );
}
