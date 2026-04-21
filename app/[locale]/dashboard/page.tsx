import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getProgressPercent, formatDate } from '@/lib/utils';
import {
  CheckCircle,
  Circle,
  Clock,
  CreditCard,
  FileText,
  Package,
  Truck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { key: 'ACCOUNT_CREATED', label: 'Account Created' },
  { key: 'PAYMENT_COMPLETE', label: 'Payment Complete' },
  { key: 'QUESTIONNAIRE_COMPLETE', label: 'Questionnaire Submitted' },
  { key: 'DOCUMENTS_GENERATED', label: 'Documents Prepared' },
  { key: 'ATTORNEY_APPROVED', label: 'Attorney Approved' },
  { key: 'SENT_TO_CLIENT', label: 'Package Sent' },
  { key: 'AWAITING_NOTARIZED_DOCS', label: 'Awaiting Notarization' },
  { key: 'DOCS_RECEIVED', label: 'Docs Received' },
  { key: 'DOCS_UPLOADED', label: 'Uploaded to Dropbox' },
  { key: 'BINDER_MAILED', label: 'Binder Mailed' },
  { key: 'COMPLETE', label: 'Complete' },
] as const;

function getStepStatus(stepKey: string, currentStatus: string) {
  const stepOrder = WORKFLOW_STEPS.map((s) => s.key);
  const currentIdx = stepOrder.indexOf(currentStatus as (typeof stepOrder)[number]);
  const stepIdx = stepOrder.indexOf(stepKey as (typeof stepOrder)[number]);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
}

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/auth/signin`);

  const t = await getTranslations({ locale });

  const userCase = await prisma.case.findUnique({
    where: { userId: session.user.id },
    include: {
      payment: true,
      questionnaire: { select: { completed: true } },
      notes: {
        where: { isInternal: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      shipments: { orderBy: { createdAt: 'desc' }, take: 2 },
    },
  });

  if (!userCase) redirect(`/${locale}/auth/signin`);

  const progress = getProgressPercent(userCase.status);
  const statusMsg = t(`dashboard.messages.${userCase.status}` as Parameters<typeof t>[0]) || '';
  const statusLabel = t(`dashboard.steps.${userCase.status}` as Parameters<typeof t>[0]) || userCase.status;

  function getNextAction() {
    switch (userCase!.status) {
      case 'ACCOUNT_CREATED':
      case 'PAYMENT_PENDING':
        return { label: t('dashboard.actions.pay'), href: `/${locale}/dashboard/payment` };
      case 'PAYMENT_COMPLETE':
        return { label: t('dashboard.actions.startQuestionnaire'), href: `/${locale}/dashboard/questionnaire` };
      case 'QUESTIONNAIRE_IN_PROGRESS':
      case 'CHANGES_REQUESTED':
        return { label: t('dashboard.actions.continueQuestionnaire'), href: `/${locale}/dashboard/questionnaire` };
      case 'SENT_TO_CLIENT':
      case 'AWAITING_NOTARIZED_DOCS':
        return userCase!.outboundTrackingNum
          ? { label: t('dashboard.actions.trackShipment'), href: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${userCase!.outboundTrackingNum}`, external: true }
          : null;
      case 'DOCS_UPLOADED':
        return userCase!.dropboxLink
          ? { label: 'View Documents in Dropbox', href: userCase!.dropboxLink, external: true }
          : null;
      default:
        return null;
    }
  }

  const nextAction = getNextAction();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">
            {t('dashboard.welcome')}, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('dashboard.caseNumber')}: <span className="font-mono font-medium">{userCase.caseNumber.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
        <Badge
          className={
            userCase.status === 'COMPLETE'
              ? 'bg-green-100 text-green-800'
              : userCase.status === 'CHANGES_REQUESTED'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {userCase.status === 'CHANGES_REQUESTED' ? (
              <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
            ) : userCase.status === 'COMPLETE' ? (
              <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-navy-800 mb-1">{t('dashboard.status')}</p>
              <p className="text-sm text-muted-foreground">{statusMsg}</p>
              {nextAction && (
                <div className="mt-4">
                  {nextAction.external ? (
                    <Button asChild size="sm" className="bg-navy-700 hover:bg-navy-800 text-white">
                      <a href={nextAction.href} target="_blank" rel="noopener noreferrer">
                        {nextAction.label}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="bg-navy-700 hover:bg-navy-800 text-white">
                      <Link href={nextAction.href}>{nextAction.label}</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{t('dashboard.progress')}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-navy-800">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {WORKFLOW_STEPS.map((step) => {
              const status = getStepStatus(step.key, userCase.status);
              return (
                <div key={step.key} className="flex items-center gap-3">
                  {status === 'done' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : status === 'current' ? (
                    <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                  )}
                  <span
                    className={
                      status === 'done'
                        ? 'text-sm text-muted-foreground line-through'
                        : status === 'current'
                        ? 'text-sm font-medium text-navy-800'
                        : 'text-sm text-gray-400'
                    }
                  >
                    {step.label}
                  </span>
                  {status === 'current' && (
                    <Badge variant="info" className="ml-auto text-xs">Current</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attorney Notes */}
      {userCase.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy-800">Messages from Your Attorney</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {userCase.notes.map((note) => (
              <div key={note.id} className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-navy-800">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(note.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Shipment Info */}
      {userCase.dropboxLink && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 flex items-start gap-4">
            <Package className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-800">Your documents are ready!</p>
              <p className="text-sm text-green-700 mt-1">
                Your executed documents have been uploaded to your secure Dropbox folder.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 border-green-600 text-green-700">
                <a href={userCase.dropboxLink} target="_blank" rel="noopener noreferrer">
                  Open Dropbox Folder
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
