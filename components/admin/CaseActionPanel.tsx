'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  MessageSquare,
  Package,
  Truck,
  Upload,
  Archive,
  Zap,
  AlertTriangle,
} from 'lucide-react';

interface CaseActionPanelProps {
  caseId: string;
  status: string;
  locale: string;
}

type Action =
  | 'generate_docs'
  | 'approve'
  | 'request_changes'
  | 'mark_sent'
  | 'mark_received'
  | 'mark_scanned'
  | 'mark_uploaded'
  | 'mark_binder_mailed';

const actionConfig: { key: Action; label: string; icon: React.ReactNode; variant: string; applicableStatuses: string[] }[] = [
  {
    key: 'generate_docs',
    label: 'Generate Documents',
    icon: <Zap className="h-4 w-4" />,
    variant: 'bg-blue-600 hover:bg-blue-700 text-white',
    applicableStatuses: ['QUESTIONNAIRE_COMPLETE', 'CHANGES_REQUESTED'],
  },
  {
    key: 'approve',
    label: 'Approve Documents',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'bg-green-600 hover:bg-green-700 text-white',
    applicableStatuses: ['DOCUMENTS_GENERATED', 'ATTORNEY_REVIEW'],
  },
  {
    key: 'request_changes',
    label: 'Request Changes',
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    applicableStatuses: ['DOCUMENTS_GENERATED', 'ATTORNEY_REVIEW', 'QUESTIONNAIRE_COMPLETE'],
  },
  {
    key: 'mark_sent',
    label: 'Mark Package Sent to Client',
    icon: <Truck className="h-4 w-4" />,
    variant: 'bg-navy-700 hover:bg-navy-800 text-white',
    applicableStatuses: ['ATTORNEY_APPROVED'],
  },
  {
    key: 'mark_received',
    label: 'Mark Notarized Docs Received',
    icon: <Package className="h-4 w-4" />,
    variant: 'bg-navy-700 hover:bg-navy-800 text-white',
    applicableStatuses: ['SENT_TO_CLIENT', 'AWAITING_NOTARIZED_DOCS'],
  },
  {
    key: 'mark_scanned',
    label: 'Mark Documents Scanned',
    icon: <Upload className="h-4 w-4" />,
    variant: 'bg-navy-700 hover:bg-navy-800 text-white',
    applicableStatuses: ['DOCS_RECEIVED'],
  },
  {
    key: 'mark_uploaded',
    label: 'Mark Uploaded to Dropbox',
    icon: <Upload className="h-4 w-4" />,
    variant: 'bg-navy-700 hover:bg-navy-800 text-white',
    applicableStatuses: ['DOCS_SCANNED'],
  },
  {
    key: 'mark_binder_mailed',
    label: 'Mark Binder Mailed',
    icon: <Archive className="h-4 w-4" />,
    variant: 'bg-green-600 hover:bg-green-700 text-white',
    applicableStatuses: ['DOCS_UPLOADED'],
  },
];

export default function CaseActionPanel({ caseId, status, locale }: CaseActionPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [dropboxLink, setDropboxLink] = useState('');
  const [trackingNum, setTrackingNum] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const applicable = actionConfig.filter((a) => a.applicableStatuses.includes(status));

  async function handleAction(action: Action) {
    setLoading(action);
    setSuccess('');
    setError('');

    const body: Record<string, string> = { action };
    if (note) body.note = note;
    if (dropboxLink && action === 'mark_uploaded') body.dropboxLink = dropboxLink;
    if (trackingNum) {
      if (action === 'mark_sent') body.outboundTrackingNum = trackingNum;
      else body.returnTrackingNum = trackingNum;
    }

    const res = await fetch(`/api/admin/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setLoading(null);
    if (res.ok) {
      setSuccess(`Action "${action.replace(/_/g, ' ')}" completed.`);
      setNote('');
      setDropboxLink('');
      setTrackingNum('');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Action failed');
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-navy-800">Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {applicable.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions available for this status.</p>
          ) : (
            applicable.map((a) => (
              <Button
                key={a.key}
                className={`w-full justify-start ${a.variant}`}
                onClick={() => handleAction(a.key)}
                disabled={loading !== null}
              >
                {loading === a.key ? (
                  <span className="animate-spin mr-2">⟳</span>
                ) : (
                  <span className="mr-2">{a.icon}</span>
                )}
                {a.label}
              </Button>
            ))
          )}
          {success && (
            <p className="text-sm text-green-600 p-2 bg-green-50 rounded">{success}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 p-2 bg-red-50 rounded">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Extra Fields */}
      {(status === 'ATTORNEY_APPROVED' || status === 'DOCS_SCANNED') && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tracking Number</Label>
              <Input
                placeholder="USPS tracking #"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'DOCS_SCANNED' && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Dropbox Sharing Link</Label>
              <Input
                placeholder="https://dropbox.com/sh/..."
                value={dropboxLink}
                onChange={(e) => setDropboxLink(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-navy-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Add Note
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Textarea
            rows={3}
            placeholder="Add a note or message..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Notes added with &quot;Request Changes&quot; will be sent to the client. Other notes are internal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
