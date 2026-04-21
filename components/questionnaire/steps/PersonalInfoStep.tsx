'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function PersonalInfoStep() {
  const t = useTranslations('questionnaire.personal');
  const { register, watch, setValue } = useFormContext();
  const maritalStatus = watch('personal.maritalStatus');
  const showSpouse = maritalStatus === 'married' || maritalStatus === 'domestic_partner';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-navy-800">{t('title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">{t('firstName')} *</Label>
          <Input id="firstName" {...register('personal.firstName', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="middleName">{t('middleName')}</Label>
          <Input id="middleName" {...register('personal.middleName')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">{t('lastName')} *</Label>
          <Input id="lastName" {...register('personal.lastName', { required: true })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dob">{t('dob')} *</Label>
          <Input id="dob" type="date" {...register('personal.dob', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ssn">{t('ssn')}</Label>
          <Input
            id="ssn"
            maxLength={4}
            placeholder="XXXX"
            {...register('personal.ssn')}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">{t('address')} *</Label>
        <Input id="address" {...register('personal.address', { required: true })} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="city">{t('city')} *</Label>
          <Input id="city" {...register('personal.city', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">{t('state')} *</Label>
          <Input id="state" defaultValue="CA" {...register('personal.state', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zip">{t('zip')} *</Label>
          <Input id="zip" {...register('personal.zip', { required: true })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('phone')} *</Label>
          <Input id="phone" type="tel" {...register('personal.phone', { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')} *</Label>
          <Input id="email" type="email" {...register('personal.email', { required: true })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t('maritalStatus')} *</Label>
        <Select
          onValueChange={(v) => setValue('personal.maritalStatus', v)}
          defaultValue={watch('personal.maritalStatus')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {['single', 'married', 'divorced', 'widowed', 'domestic_partner'].map((opt) => (
              <SelectItem key={opt} value={opt}>
                {t(`maritalOptions.${opt as 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partner'}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSpouse && (
        <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
          <h3 className="font-medium text-navy-700">{t('spouseTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="spouseFirst">{t('spouseFirst')}</Label>
              <Input id="spouseFirst" {...register('personal.spouseFirst')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spouseLast">{t('spouseLast')}</Label>
              <Input id="spouseLast" {...register('personal.spouseLast')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spouseDob">{t('spouseDob')}</Label>
            <Input id="spouseDob" type="date" {...register('personal.spouseDob')} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="jointTrust"
              onCheckedChange={(checked) => setValue('personal.jointTrust', !!checked)}
              checked={!!watch('personal.jointTrust')}
            />
            <Label htmlFor="jointTrust" className="font-normal cursor-pointer">
              {t('jointTrust')}
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
