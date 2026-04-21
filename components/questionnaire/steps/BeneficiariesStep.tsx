'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function BeneficiariesStep() {
  const t = useTranslations('questionnaire.beneficiaries');
  const { register, control } = useFormContext();

  const {
    fields: primaryFields,
    append: addPrimary,
    remove: removePrimary,
  } = useFieldArray({ control, name: 'beneficiaries.primary' });

  const {
    fields: contingentFields,
    append: addContingent,
    remove: removeContingent,
  } = useFieldArray({ control, name: 'beneficiaries.contingent' });

  const {
    fields: specificFields,
    append: addSpecific,
    remove: removeSpecific,
  } = useFieldArray({ control, name: 'beneficiaries.specific' });

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>

      {/* Primary */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-navy-700">{t('primaryTitle')}</h3>
          <p className="text-xs text-muted-foreground">{t('primaryHelp')}</p>
        </div>
        {primaryFields.map((field, idx) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-navy-700">Beneficiary #{idx + 1}</span>
              {primaryFields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removePrimary(idx)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t('name')} *</Label>
                <Input {...register(`beneficiaries.primary.${idx}.name`, { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('relationship')} *</Label>
                <Input {...register(`beneficiaries.primary.${idx}.relationship`, { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('percentage')} *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  {...register(`beneficiaries.primary.${idx}.percentage`, {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('dob')}</Label>
              <Input type="date" {...register(`beneficiaries.primary.${idx}.dob`)} />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addPrimary({ name: '', relationship: '', percentage: '', dob: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('add')}
        </Button>
      </div>

      {/* Contingent */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-navy-700">{t('contingentTitle')}</h3>
          <p className="text-xs text-muted-foreground">{t('contingentHelp')}</p>
        </div>
        {contingentFields.map((field, idx) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-navy-700">Contingent Beneficiary #{idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeContingent(idx)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t('name')}</Label>
                <Input {...register(`beneficiaries.contingent.${idx}.name`)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('relationship')}</Label>
                <Input {...register(`beneficiaries.contingent.${idx}.relationship`)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('percentage')}</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  {...register(`beneficiaries.contingent.${idx}.percentage`, { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addContingent({ name: '', relationship: '', percentage: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('add')}
        </Button>
      </div>

      {/* Specific Bequests */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-navy-700">{t('specificTitle')}</h3>
          <p className="text-xs text-muted-foreground">{t('specificHelp')}</p>
        </div>
        {specificFields.map((field, idx) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Bequest #{idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecific(idx)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('specificItem')}</Label>
                <Input {...register(`beneficiaries.specific.${idx}.item`)} placeholder="e.g. $10,000 or my jewelry" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('specificRecipient')}</Label>
                <Input {...register(`beneficiaries.specific.${idx}.recipient`)} />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSpecific({ item: '', recipient: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('addSpecific')}
        </Button>
      </div>
    </div>
  );
}
