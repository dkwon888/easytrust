import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CaseActionPanel from '@/components/admin/CaseActionPanel';
import {
  User,
  CreditCard,
  FileText,
  MessageSquare,
  Package,
  ExternalLink,
} from 'lucide-react';

export default async function CaseDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!session?.user || !['ATTORNEY', 'ADMIN'].includes(role ?? '')) {
    redirect(`/${locale}/auth/signin`);
  }

  const t = await getTranslations({ locale, namespace: 'admin' });

  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, preferredLang: true, createdAt: true } },
      payment: true,
      questionnaire: true,
      documents: { orderBy: { createdAt: 'asc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      shipments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!c) notFound();

  const questData = (c.questionnaire?.data ?? {}) as Record<string, Record<string, unknown>>;
  const personal = questData.personal ?? {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">
            {c.user.name ?? c.user.email}
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Case #{c.caseNumber.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <Badge className="text-sm px-3 py-1" variant={c.status === 'COMPLETE' ? 'success' : 'info'}>
          {c.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Case info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Name" value={c.user.name ?? '—'} />
              <InfoRow label="Email" value={c.user.email} />
              <InfoRow label="Phone" value={(personal.phone as string) ?? '—'} />
              <InfoRow label="Address" value={`${personal.address ?? ''} ${personal.city ?? ''}, ${personal.state ?? ''} ${personal.zip ?? ''}`} />
              <InfoRow label="Language" value={c.user.preferredLang === 'ko' ? 'Korean' : 'English'} />
              <InfoRow label="Created" value={formatDate(c.createdAt)} />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
              {c.payment ? (
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Status" value={c.payment.status} />
                  <InfoRow label="Amount" value={`$${(c.payment.amount / 100).toFixed(2)}`} />
                  <InfoRow label="Paid At" value={c.payment.paidAt ? formatDate(c.payment.paidAt) : '—'} />
                  <InfoRow label="Stripe ID" value={c.payment.stripePaymentId ?? '—'} />
                </div>
              ) : (
                <p className="text-muted-foreground">No payment recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Questionnaire Summary */}
          {c.questionnaire?.completed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Questionnaire Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm space-y-4">
                <div>
                  <p className="font-medium text-navy-700 mb-1">Trust</p>
                  <InfoRow label="Trust Name" value={(questData.trust?.trustName as string) ?? '—'} />
                  <InfoRow label="1st Successor" value={(questData.trust?.successorFirst as { name?: string })?.name ?? '—'} />
                  <InfoRow label="2nd Successor" value={(questData.trust?.successorSecond as { name?: string })?.name ?? '—'} />
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-navy-700 mb-1">Beneficiaries</p>
                  {((questData.beneficiaries?.primary as Array<{ name: string; percentage: number }>) ?? []).map((b, i) => (
                    <p key={i} className="text-xs">{b.name} — {b.percentage}%</p>
                  ))}
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-navy-700 mb-1">POA Agent</p>
                  <InfoRow label="Agent" value={(questData.poa?.agent as { name?: string })?.name ?? '—'} />
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-navy-700 mb-1">Healthcare Agent</p>
                  <InfoRow label="Agent" value={(questData.healthcare?.agent as { name?: string })?.name ?? '—'} />
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-navy-700 mb-1">Engagement Letter</p>
                  <InfoRow
                    label="Signed By"
                    value={(questData.engagement?.signature as { name?: string })?.name ?? '—'}
                  />
                  <InfoRow
                    label="Signed At"
                    value={(questData.engagement?.signature as { date?: string })?.date ?? '—'}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {c.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" /> Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {c.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="font-medium">{doc.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <Badge variant={doc.isExecuted ? 'success' : 'secondary'}>
                        {doc.isExecuted ? 'Executed' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
                {c.dropboxLink && (
                  <a
                    href={c.dropboxLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    View in Dropbox <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {c.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Case Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {c.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg text-sm ${
                      note.isInternal ? 'bg-yellow-50 border border-yellow-100' : 'bg-blue-50 border border-blue-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {note.isInternal ? '🔒 Internal' : '📧 Client Message'}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                    </div>
                    <p>{note.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Action Panel */}
        <div className="lg:col-span-1">
          <CaseActionPanel caseId={id} status={c.status} locale={locale} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-0.5">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
