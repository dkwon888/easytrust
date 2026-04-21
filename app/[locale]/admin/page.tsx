import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ACCOUNT_CREATED: 'secondary',
  PAYMENT_PENDING: 'warning',
  PAYMENT_COMPLETE: 'info',
  QUESTIONNAIRE_IN_PROGRESS: 'info',
  QUESTIONNAIRE_COMPLETE: 'gold',
  DOCUMENTS_GENERATING: 'info',
  DOCUMENTS_GENERATED: 'gold',
  ATTORNEY_REVIEW: 'warning',
  CHANGES_REQUESTED: 'warning',
  ATTORNEY_APPROVED: 'success',
  SENT_TO_CLIENT: 'info',
  AWAITING_NOTARIZED_DOCS: 'info',
  DOCS_RECEIVED: 'gold',
  DOCS_SCANNED: 'gold',
  DOCS_UPLOADED: 'success',
  BINDER_MAILED: 'success',
  COMPLETE: 'success',
};

export default async function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [cases, stats] = await Promise.all([
    prisma.case.findMany({
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
        questionnaire: { select: { completed: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.case.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const needsAttention = cases.filter((c) =>
    ['QUESTIONNAIRE_COMPLETE', 'DOCUMENTS_GENERATED', 'DOCS_RECEIVED'].includes(c.status)
  );

  const totalCases = cases.length;
  const completedCases = cases.filter((c) => c.status === 'COMPLETE').length;
  const activeCases = cases.filter((c) => !['COMPLETE', 'ACCOUNT_CREATED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">{t('title')}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-navy-600" />
            <div>
              <div className="text-2xl font-bold">{totalCases}</div>
              <div className="text-xs text-muted-foreground">Total Clients</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{activeCases}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{needsAttention.length}</div>
              <div className="text-xs text-muted-foreground">Needs Action</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{completedCases}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Needs Your Attention ({needsAttention.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {needsAttention.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{c.user.name ?? c.user.email}</p>
                    <p className="text-xs text-muted-foreground">{c.status.replace(/_/g, ' ')}</p>
                  </div>
                  <Button asChild size="sm" className="bg-navy-700 hover:bg-navy-800 text-white">
                    <Link href={`/${locale}/admin/cases/${c.id}`}>{t('actions.review')}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-800">{t('cases')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">{t('columns.caseNumber')}</th>
                  <th className="px-4 py-3 font-medium">{t('columns.client')}</th>
                  <th className="px-4 py-3 font-medium">{t('columns.status')}</th>
                  <th className="px-4 py-3 font-medium">{t('columns.updated')}</th>
                  <th className="px-4 py-3 font-medium">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{c.caseNumber.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.user.name}</div>
                      <div className="text-xs text-muted-foreground">{c.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(STATUS_COLORS[c.status] ?? 'secondary') as 'secondary' | 'success' | 'warning' | 'info' | 'gold' | 'destructive' | 'outline' | 'default'}>
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/${locale}/admin/cases/${c.id}`}>{t('actions.review')}</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
