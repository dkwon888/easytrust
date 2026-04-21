'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function RadioGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const { register } = useFormContext();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              value={opt.value}
              {...register(name)}
              className="mt-0.5 h-4 w-4 text-navy-700"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function HealthcareStep() {
  const t = useTranslations('questionnaire.healthcare');
  const { register } = useFormContext();

  const lifeSustainingOptions = [
    { value: 'prolong', label: t('lifeSustainingOptions.prolong') },
    { value: 'comfort', label: t('lifeSustainingOptions.comfort') },
    { value: 'conditional', label: t('lifeSustainingOptions.conditional') },
  ];
  const artificialOptions = [
    { value: 'yes', label: t('artificialOptions.yes') },
    { value: 'no', label: t('artificialOptions.no') },
    { value: 'agent', label: t('artificialOptions.agent') },
  ];
  const organOptions = [
    { value: 'yes', label: t('organOptions.yes') },
    { value: 'limited', label: t('organOptions.limited') },
    { value: 'no', label: t('organOptions.no') },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>

      {/* Healthcare Agent */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-navy-700">{t('agent.label')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('agent.name')} *</Label>
            <Input {...register('healthcare.agent.name', { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('agent.relationship')} *</Label>
            <Input {...register('healthcare.agent.relationship', { required: true })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('agent.address')}</Label>
            <Input {...register('healthcare.agent.address')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('agent.phone')}</Label>
            <Input type="tel" {...register('healthcare.agent.phone')} />
          </div>
        </div>
      </div>

      {/* Alternate */}
      <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
        <h3 className="font-medium text-navy-700">{t('alternate.label')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>{t('alternate.name')}</Label>
            <Input {...register('healthcare.alternate.name')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('alternate.relationship')}</Label>
            <Input {...register('healthcare.alternate.relationship')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('alternate.phone')}</Label>
            <Input type="tel" {...register('healthcare.alternate.phone')} />
          </div>
        </div>
      </div>

      {/* Directives */}
      <div className="space-y-5">
        <RadioGroup name="healthcare.lifeSustaining" label={t('lifeSustaining')} options={lifeSustainingOptions} />
        <RadioGroup name="healthcare.artificialNutrition" label={t('artificialNutrition')} options={artificialOptions} />
        <RadioGroup name="healthcare.organDonation" label={t('organDonation')} options={organOptions} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="additionalWishes">{t('additionalWishes')}</Label>
        <Textarea
          id="additionalWishes"
          rows={4}
          placeholder="Any additional wishes or instructions..."
          {...register('healthcare.additionalWishes')}
        />
      </div>
    </div>
  );
}
