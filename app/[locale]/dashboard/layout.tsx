import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/signin`);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated userRole={session.user.role as string} />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
