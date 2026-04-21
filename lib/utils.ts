import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export const WORKFLOW_STEPS = [
  'ACCOUNT_CREATED',
  'PAYMENT_COMPLETE',
  'QUESTIONNAIRE_COMPLETE',
  'DOCUMENTS_GENERATED',
  'ATTORNEY_APPROVED',
  'SENT_TO_CLIENT',
  'AWAITING_NOTARIZED_DOCS',
  'DOCS_RECEIVED',
  'DOCS_UPLOADED',
  'BINDER_MAILED',
  'COMPLETE',
] as const;

export function getStepIndex(status: string): number {
  return WORKFLOW_STEPS.indexOf(status as (typeof WORKFLOW_STEPS)[number]);
}

export function getProgressPercent(status: string): number {
  const idx = getStepIndex(status);
  if (idx < 0) return 5;
  return Math.round((idx / (WORKFLOW_STEPS.length - 1)) * 100);
}
