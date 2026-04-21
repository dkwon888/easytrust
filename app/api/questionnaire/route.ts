import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await req.json();

  const userCase = await prisma.case.findUnique({ where: { userId: session.user.id } });
  if (!userCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  await prisma.questionnaire.upsert({
    where: { caseId: userCase.id },
    create: { caseId: userCase.id, data, completed: false },
    update: { data },
  });

  if (userCase.status === 'PAYMENT_COMPLETE') {
    await prisma.case.update({
      where: { id: userCase.id },
      data: { status: 'QUESTIONNAIRE_IN_PROGRESS' },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await req.json();

  const userCase = await prisma.case.findUnique({ where: { userId: session.user.id } });
  if (!userCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

  await prisma.questionnaire.upsert({
    where: { caseId: userCase.id },
    create: { caseId: userCase.id, data, completed: true, signedAt: new Date() },
    update: { data, completed: true, signedAt: new Date() },
  });

  await prisma.case.update({
    where: { id: userCase.id },
    data: { status: 'QUESTIONNAIRE_COMPLETE' },
  });

  return NextResponse.json({ ok: true });
}
