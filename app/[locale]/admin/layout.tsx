import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!session?.user || !['ATTORNEY', 'ADMIN'].includes(role ?? '')) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated userRole={role} />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
