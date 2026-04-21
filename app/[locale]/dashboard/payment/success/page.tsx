import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default async function PaymentSuccessPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { session_id?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/auth/signin`);

  const userCase = await prisma.case.findUnique({ where: { userId: session.user.id } });
  if (userCase?.status === 'ACCOUNT_CREATED' || userCase?.status === 'PAYMENT_PENDING') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-navy-800 mb-2">Payment Received!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you. Your payment has been processed successfully. The next step is to complete your estate planning questionnaire.
          </p>
          <Button asChild className="w-full bg-navy-700 hover:bg-navy-800 text-white">
            <Link href={`/${locale}/dashboard/questionnaire`}>
              Start Questionnaire
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
