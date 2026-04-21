import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTrustPackage } from '@/lib/pdf-generator';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads');

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { caseId } = body;

  const userCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: { questionnaire: true },
  });

  if (!userCase || !userCase.questionnaire?.completed) {
    return NextResponse.json({ error: 'Questionnaire not complete' }, { status: 400 });
  }

  const attorney = {
    name: process.env.ATTORNEY_NAME ?? 'Attorney Name',
    barNumber: process.env.ATTORNEY_BAR_NUMBER ?? 'Bar No. XXXXXX',
    firm: process.env.ATTORNEY_FIRM ?? 'Law Offices',
    address: process.env.ATTORNEY_ADDRESS ?? '123 Main St',
    phone: process.env.ATTORNEY_PHONE ?? '(555) 555-5555',
    email: process.env.ATTORNEY_EMAIL ?? 'attorney@example.com',
  };

  await prisma.case.update({
    where: { id: caseId },
    data: { status: 'DOCUMENTS_GENERATING' },
  });

  const docs = await generateTrustPackage(userCase.questionnaire.data as never, attorney);

  const caseDir = path.join(UPLOADS_DIR, caseId);
  fs.mkdirSync(caseDir, { recursive: true });

  const created: { type: string; fileName: string; filePath: string }[] = [];
  for (const doc of docs) {
    const fileName = `${doc.type}.pdf`;
    const filePath = path.join(caseDir, fileName);
    fs.writeFileSync(filePath, doc.bytes);
    created.push({ type: doc.type, fileName, filePath });
  }

  await prisma.$transaction([
    prisma.document.deleteMany({ where: { caseId, isExecuted: false } }),
    ...created.map((d) =>
      prisma.document.create({
        data: { caseId, type: d.type, fileName: d.fileName, filePath: d.filePath },
      })
    ),
    prisma.case.update({
      where: { id: caseId },
      data: { status: 'DOCUMENTS_GENERATED' },
    }),
  ]);

  return NextResponse.json({ ok: true, count: docs.length });
}
