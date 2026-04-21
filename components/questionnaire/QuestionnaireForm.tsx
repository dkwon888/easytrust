'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalInfoStep from './steps/PersonalInfoStep';
import TrustStructureStep from './steps/TrustStructureStep';
import BeneficiariesStep from './steps/BeneficiariesStep';
import AssetsStep from './steps/AssetsStep';
import POAStep from './steps/POAStep';
import HealthcareStep from './steps/HealthcareStep';
import HIPAAStep from './steps/HIPAAStep';
import EngagementLetterStep from './steps/EngagementLetterStep';
import { CheckCircle, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const STEPS = [
  'personal',
  'trust',
  'beneficiaries',
  'assets',
  'poa',
  'healthcare',
  'hipaa',
  'engagement',
] as const;

type Step = (typeof STEPS)[number];

interface QuestionnaireFormProps {
  initialData?: Record<string, unknown>;
  isCompleted?: boolean;
}

export default function QuestionnaireForm({ initialData, isCompleted }: QuestionnaireFormProps) {
  const t = useTranslations('questionnaire');
  const locale = useLocale();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [submitError, setSubmitError] = useState('');

  const methods = useForm({
    defaultValues: initialData ?? {},
    mode: 'onChange',
  });

  const { handleSubmit, getValues, watch } = methods;

  const saveProgress = useCallback(
    async (data?: Record<string, unknown>) => {
      setSaving(true);
      const values = data ?? getValues();
      await fetch('/api/questionnaire', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values }),
      });
      setSaving(false);
      setSavedAt(new Date());
    },
    [getValues]
  );

  // Auto-save every 30s
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => saveProgress(), 30000);
    return () => clearInterval(interval);
  }, [isCompleted, saveProgress]);

  async function handleNext() {
    await saveProgress();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleBack() {
    await saveProgress();
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function onSubmit(data: Record<string, unknown>) {
    setSubmitError('');
    setSaving(true);
    const res = await fetch('/api/questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    setSaving(false);
    if (res.ok) {
      router.push(`/${locale}/dashboard`);
    } else {
      const body = await res.json();
      setSubmitError(body.error ?? 'Submission failed. Please try again.');
    }
  }

  const stepKeys = STEPS;
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const stepComponents: Record<Step, React.ReactNode> = {
    personal: <PersonalInfoStep />,
    trust: <TrustStructureStep />,
    beneficiaries: <BeneficiariesStep />,
    assets: <AssetsStep />,
    poa: <POAStep />,
    healthcare: <HealthcareStep />,
    hipaa: <HIPAAStep />,
    engagement: <EngagementLetterStep />,
  };

  if (isCompleted) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy-800 mb-2">Questionnaire Submitted</h2>
          <p className="text-muted-foreground">
            Your questionnaire has been submitted. Your attorney is preparing your documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-800">{t('title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
        </div>

        {/* Step tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max pb-2">
            {stepKeys.map((step, idx) => (
              <button
                key={step}
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  idx === currentStep
                    ? 'bg-navy-700 text-white'
                    : idx < currentStep
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {idx < currentStep && <CheckCircle className="inline h-3 w-3 mr-1" />}
                {idx + 1}. {t(`steps.${step}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{t('progress', { current: currentStep + 1, total: STEPS.length })}</span>
            <span className="flex items-center gap-1">
              {saving ? (
                <>{t('saving')}</>
              ) : savedAt ? (
                <><Save className="h-3 w-3" /> {t('saved')}</>
              ) : null}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit(onSubmit as (data: Record<string, unknown>) => void)}>
          <Card>
            <CardContent className="p-6 md:p-8">
              {stepComponents[stepKeys[currentStep]]}
            </CardContent>
          </Card>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('back')}
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-navy-700 hover:bg-navy-800 text-white"
                disabled={saving}
              >
                {t('next')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={saving}
              >
                {saving ? t('saving') : t('submit')}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
