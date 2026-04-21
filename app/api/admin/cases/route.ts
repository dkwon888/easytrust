import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['ATTORNEY', 'ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const cases = await prisma.case.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { caseNumber: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      payment: { select: { status: true, paidAt: true } },
      questionnaire: { select: { completed: true } },
      documents: { select: { type: true, isExecuted: true }, where: { isExecuted: false } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(cases);
}
