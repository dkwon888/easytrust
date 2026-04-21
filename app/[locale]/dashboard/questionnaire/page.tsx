import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import QuestionnaireForm from '@/components/questionnaire/QuestionnaireForm';

export default async function QuestionnairePage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/auth/signin`);

  const userCase = await prisma.case.findUnique({
    where: { userId: session.user.id },
    include: { questionnaire: true, payment: true },
  });

  if (!userCase) redirect(`/${locale}/dashboard`);

  const unpaid =
    userCase.status === 'ACCOUNT_CREATED' || userCase.status === 'PAYMENT_PENDING';
  if (unpaid) redirect(`/${locale}/dashboard/payment`);

  return (
    <QuestionnaireForm
      initialData={userCase.questionnaire?.data as Record<string, unknown> | undefined}
      isCompleted={userCase.questionnaire?.completed}
    />
  );
}
