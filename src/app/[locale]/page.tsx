'use client';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { Navbar } from '@/components/navbar';
import { BookOpen, FileUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function QuizApp() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const t = useTranslations('WelcomePage');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status
    const user = localStorage.getItem('user');
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    setIsAuthenticated(true);

    // Rest of your existing useEffect logic
    const firstVisit = !localStorage.getItem('welcomeShown');
    if (firstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }
    const storedCount = localStorage.getItem('quizCount');
    setQuizCount(storedCount ? parseInt(storedCount) : 0);
    setApiKey(localStorage.getItem('apiKey'));
  }, [router, locale]);

  // If not authenticated, return null to prevent flash of content
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white text-gray-800">
        <Navbar quizCount={quizCount} />
        <WelcomeModal
          open={showWelcomeModal}
          onOpenChange={setShowWelcomeModal}
        />

        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-orange">
            {t('welcome')}
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('chosemessage')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group">
              <button
                onClick={() => router.push(`/${locale}/upload`)}
                className="w-full h-full flex flex-col items-center justify-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group-hover:scale-105"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-4 text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300">
                  <FileUp size={32} />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-orange">
                  {t('addDocument.title')}
                </h2>
                <p className="text-gray-500 text-center">
                  {t('addDocument.description')}
                </p>
              </button>
            </div>

            <div className="group">
              <button
                onClick={() => router.push(`/${locale}/subject`)}
                className="w-full h-full flex flex-col items-center justify-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group-hover:scale-105"
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-4 text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300">
                  <BookOpen size={32} />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-orange">
                  {t('exploreBooks.title')}
                </h2>
                <p className="text-gray-500 text-center">
                  {t('exploreBooks.description')}
                </p>
              </button>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              {t('infoMessage1')}{' '}
              <span className="font-bold text-orange">{quizCount}</span>{' '}
              {t('infoMessage2')}
            </p>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
