'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === 'en' ? 'ko' : 'en';
  const label = locale === 'en' ? '한국어' : 'English';

  function handleSwitch() {
    const segments = pathname.split('/');
    segments[1] = otherLocale;
    router.push(segments.join('/'));
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      className="text-sm font-medium"
      aria-label="Switch language"
    >
      {label}
    </Button>
  );
}
