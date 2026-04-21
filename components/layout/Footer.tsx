import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Scale } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const year = new Date().getFullYear();

  const attorneyName = process.env.ATTORNEY_NAME ?? 'Your Attorney';
  const barNumber = process.env.ATTORNEY_BAR_NUMBER ?? 'Bar No. XXXXXX';

  return (
    <footer className="border-t bg-navy-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">EasyTrust</span>
            </div>
            <p className="text-sm text-white/70">{t('tagline')}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white/90">Links</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href={`/${locale}#how-it-works`} className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#pricing`} className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#faq`} className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white/90">Legal</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {t('links.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {t('links.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
          <p className="text-xs text-white/50">{t('disclaimer')}</p>
          <p className="text-xs text-white/50">{t('attorney', { name: attorneyName, bar: barNumber })}</p>
          <p className="text-xs text-white/40">{t('copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
