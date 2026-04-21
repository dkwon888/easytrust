import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  action: z.enum([
    'approve',
    'request_changes',
    'mark_sent',
    'mark_received',
    'mark_scanned',
    'mark_uploaded',
    'mark_binder_mailed',
    'generate_docs',
  ]),
  note: z.string().optional(),
  dropboxLink: z.string().url().optional(),
  returnTrackingNum: z.string().optional(),
  outboundTrackingNum: z.string().optional(),
});

const statusMap: Record<string, string> = {
  approve: 'ATTORNEY_APPROVED',
  request_changes: 'CHANGES_REQUESTED',
  mark_sent: 'SENT_TO_CLIENT',
  mark_received: 'DOCS_RECEIVED',
  mark_scanned: 'DOCS_SCANNED',
  mark_uploaded: 'DOCS_UPLOADED',
  mark_binder_mailed: 'BINDER_MAILED',
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || !['ATTORNEY', 'ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const c = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, preferredLang: true } },
      payment: true,
      questionnaire: true,
      documents: { orderBy: { createdAt: 'asc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      shipments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || !['ATTORNEY', 'ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { action, note, dropboxLink, returnTrackingNum, outboundTrackingNum } = parsed.data;
  const newStatus = statusMap[action];

  const updates: Record<string, unknown> = {};
  if (newStatus) updates.status = newStatus;
  if (dropboxLink) updates.dropboxLink = dropboxLink;
  if (returnTrackingNum) updates.returnTrackingNum = returnTrackingNum;
  if (outboundTrackingNum) updates.outboundTrackingNum = outboundTrackingNum;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(updates).length > 0) {
      await tx.case.update({ where: { id: params.id }, data: updates as never });
    }
    if (note) {
      await tx.caseNote.create({
        data: {
          caseId: params.id,
          authorId: session.user!.id!,
          content: note,
          isInternal: action !== 'request_changes',
        },
      });
    }
  });

  if (action === 'generate_docs') {
    const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    fetch(`${origin}/api/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') ?? '' },
      body: JSON.stringify({ caseId: params.id }),
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
