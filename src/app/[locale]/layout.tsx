import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Locals } from '@/i18n/request';
import '../globals.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LaLaLand: Tunisian Learning Platform',
  description: `LaLaLand uses artificial intelligence to create questions suitable for quizzes, exams, or general practice.  
  This tool can transform your content into a complete quiz in seconds.  
  Simply upload your material and let the question generator produce a customized assessment tool for you.`,
  authors: {
    name: 'Mohamed Rami Zairi',
    url: '@medramizairi'
  },
  metadataBase: new URL('https://med-rami.me/')
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS || '';
  if (!routing.locales.includes(locale as Locals)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <main>{children}</main>
          <Toaster richColors />
          <GoogleAnalytics gaId={GOOGLE_ANALYTICS} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
