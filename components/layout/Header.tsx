'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import LocaleSwitcher from './LocaleSwitcher';
import { Scale } from 'lucide-react';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

export default function Header({ isAuthenticated, userRole }: HeaderProps) {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-600">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-navy-700">EasyTrust</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}#how-it-works`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('howItWorks')}
          </Link>
          <Link
            href={`/${locale}#pricing`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('pricing')}
          </Link>
          <Link
            href={`/${locale}#faq`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('faq')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${locale}/${userRole === 'ATTORNEY' || userRole === 'ADMIN' ? 'admin' : 'dashboard'}`}>
                  {t('dashboard')}
                </Link>
              </Button>
              <form action={`/api/auth/signout`} method="POST">
                <Button variant="outline" size="sm" type="submit">
                  {t('signOut')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
              </Button>
              <Button asChild size="sm" className="bg-navy-700 hover:bg-navy-800 text-white">
                <Link href={`/${locale}/auth/signup`}>{t('getStarted')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
