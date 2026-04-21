import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR, Noto_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
});

export const metadata: Metadata = {
  title: 'EasyTrust | Revocable Living Trust Attorney Service',
  description:
    'Professional revocable living trust packages prepared by a licensed California attorney. Complete estate planning in English and Korean.',
  keywords: 'revocable living trust, estate planning, California attorney, Korean, 유언대용신탁',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansKr.variable} ${notoSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
