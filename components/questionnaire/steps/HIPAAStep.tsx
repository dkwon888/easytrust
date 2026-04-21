'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function HIPAAStep() {
  const t = useTranslations('questionnaire.hipaa');
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'hipaa.persons' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('help')}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-navy-700">Person #{idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t('name')} *</Label>
                <Input {...register(`hipaa.persons.${idx}.name`, { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('relationship')}</Label>
                <Input {...register(`hipaa.persons.${idx}.relationship`)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('phone')}</Label>
                <Input type="tel" {...register(`hipaa.persons.${idx}.phone`)} />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', relationship: '', phone: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('add')}
        </Button>
      </div>
    </div>
  );
}
