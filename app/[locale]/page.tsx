import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import {
  Scale,
  FileText,
  Heart,
  Shield,
  UserCheck,
  Award,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Mail,
  Printer,
  Stamp,
  Package,
} from 'lucide-react';

const documentIcons: Record<string, React.ReactNode> = {
  trust: <Scale className="h-6 w-6" />,
  poa: <UserCheck className="h-6 w-6" />,
  ahcd: <Heart className="h-6 w-6" />,
  hipaa: <Shield className="h-6 w-6" />,
  will: <FileText className="h-6 w-6" />,
  certificate: <Award className="h-6 w-6" />,
};

const stepIcons = [
  <UserCheck key="1" className="h-6 w-6" />,
  <FileText key="2" className="h-6 w-6" />,
  <Scale key="3" className="h-6 w-6" />,
  <Printer key="4" className="h-6 w-6" />,
  <Package key="5" className="h-6 w-6" />,
];

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  const t = await getTranslations({ locale });

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isAuthenticated={!!session?.user}
        userRole={session?.user?.role as string | undefined}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-700 to-navy-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gold-400 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-400 blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container relative py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-gold-500/20 text-gold-300 border-gold-500/30 text-sm px-4 py-1.5">
              {t('hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto text-balance">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="xl" className="bg-gold-500 hover:bg-gold-600 text-white font-semibold">
                <Link href={`/${locale}/auth/signup`}>
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={`#how-it-works`}>{t('hero.secondaryCta')}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(t.raw('hero.features') as Record<string, string>).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 justify-center text-sm text-white/80">
                  <CheckCircle className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <ChevronDown className="h-6 w-6 text-white/40 animate-bounce" />
        </div>
      </section>

      {/* Documents */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              {t('whatYouGet.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('whatYouGet.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(['trust', 'poa', 'ahcd', 'hipaa', 'will', 'certificate'] as const).map((doc) => (
              <Card key={doc} className="hover:shadow-md transition-shadow border-navy-100">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-navy-600 shrink-0">
                      {documentIcons[doc]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-800 mb-1">
                        {t(`whatYouGet.documents.${doc}.name`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`whatYouGet.documents.${doc}.desc`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-muted-foreground text-lg">{t('howItWorks.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {([1, 2, 3, 4, 5] as const).map((step, idx) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {idx < 4 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full h-0.5 bg-navy-200 z-0" />
                )}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy-600 text-white mb-4">
                  {stepIcons[idx]}
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-white text-xs font-bold">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-navy-800 mb-2">
                  {t(`howItWorks.steps.${step}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`howItWorks.steps.${step}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              {t('pricing.title')}
            </h2>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-navy-600 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-navy-800 mb-2">{t('pricing.price')}</div>
                  <div className="text-muted-foreground">{t('pricing.period')}</div>
                </div>
                <p className="font-semibold text-navy-700 mb-4">{t('pricing.includes')}</p>
                <ul className="space-y-3 mb-8">
                  {(t.raw('pricing.features') as string[]).map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="xl" className="w-full bg-navy-700 hover:bg-navy-800 text-white">
                  <Link href={`/${locale}/auth/signup`}>
                    {t('pricing.cta')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">{t('faq.title')}</h2>
          </div>
          <div className="max-w-3xl mx-auto grid gap-4">
            {(t.raw('faq.items') as Array<{ q: string; a: string }>).map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy-800 mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-navy-800 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Family?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start your complete estate planning package today with a licensed attorney.
          </p>
          <Button asChild size="xl" className="bg-gold-500 hover:bg-gold-600 text-white font-semibold">
            <Link href={`/${locale}/auth/signup`}>
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
