'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollText, AlertCircle } from 'lucide-react';

const ACK_KEYS = ['read', 'attorney', 'fee', 'notarize', 'california', 'limitations'] as const;

export default function EngagementLetterStep() {
  const t = useTranslations('questionnaire.engagement');
  const { register, watch, setValue } = useFormContext();
  const acks: Record<string, boolean> = watch('engagement.acknowledgments') ?? {};
  const sigName = watch('engagement.signature.name') ?? '';
  const allChecked = ACK_KEYS.every((k) => acks[k]);

  const attorneyName = process.env.NEXT_PUBLIC_ATTORNEY_NAME ?? 'Your Attorney';
  const barNumber = process.env.NEXT_PUBLIC_ATTORNEY_BAR ?? 'Bar No. XXXXXX';
  const firmName = process.env.NEXT_PUBLIC_FIRM_NAME ?? 'Law Offices';

  const sections = [
    { key: 'scope', content: t('sections.scope.content') },
    { key: 'fees', content: t('sections.fees.content') },
    {
      key: 'relationship',
      content: t('sections.relationship.content', { attorneyName, barNumber }),
    },
    { key: 'limitations', content: t('sections.limitations.content') },
    { key: 'confidentiality', content: t('sections.confidentiality.content') },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-navy-700 shrink-0" />
        <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          {t('intro', { attorneyName, firmName })}
        </p>
      </div>

      {/* Agreement text */}
      <Card>
        <CardContent className="p-6 max-h-96 overflow-y-auto space-y-4">
          {sections.map((section) => (
            <div key={section.key}>
              <h3 className="font-semibold text-navy-800 mb-1">
                {t(`sections.${section.key}.title`)}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Acknowledgments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800">{t('acknowledgments.title')}</h3>
        {ACK_KEYS.map((key) => (
          <div key={key} className="flex items-start gap-3">
            <Checkbox
              id={`ack-${key}`}
              checked={!!acks[key]}
              onCheckedChange={(checked) =>
                setValue(`engagement.acknowledgments.${key}`, !!checked)
              }
            />
            <Label htmlFor={`ack-${key}`} className="font-normal text-sm cursor-pointer leading-relaxed">
              {key === 'attorney'
                ? t('acknowledgments.attorney', { attorneyName })
                : t(`acknowledgments.${key}` as Parameters<typeof t>[0])}
            </Label>
          </div>
        ))}
      </div>

      {/* Signature */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-navy-800">{t('signature.title')}</h3>
        <div className="space-y-1.5">
          <Label htmlFor="sigName">{t('signature.label')}</Label>
          <Input
            id="sigName"
            placeholder={t('signature.placeholder')}
            {...register('engagement.signature.name', { required: true })}
            className={!allChecked ? 'opacity-50' : ''}
            disabled={!allChecked}
          />
          {!allChecked && (
            <p className="text-xs text-amber-600">Please check all acknowledgments before signing.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>{t('signature.date')}</Label>
          <Input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            {...register('engagement.signature.date')}
          />
        </div>
        {sigName && allChecked && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✓ {t('signature.agree')}
            </p>
            <p className="text-base font-serif mt-2 text-navy-800 italic">{sigName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
