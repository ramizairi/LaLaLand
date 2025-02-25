'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/navbar';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

interface Subject {
  url: string;
  description: string;
  icon: string;
  coverImage: string;
}

interface GradeLevelContent {
  [key: string]: {
    [key: string]: Subject;
  };
}

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('Subject');
  const homeT = useTranslations('Home'); // Add this line to access Home translations
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userGrade, setUserGrade] = useState<string>('1');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [gradeContent, setGradeContent] = useState<GradeLevelContent>({});

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null;

  useEffect(() => {
    if (!user) {
      router.replace('/en/login');
      return;
    }

    setUserGrade(user.gradeLevel || '1');
    setIsAuthenticated(true);

    const firstVisit = !localStorage.getItem('welcomeShown');
    if (firstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }

    const storedCount = localStorage.getItem('quizCount');
    setQuizCount(storedCount ? parseInt(storedCount) : 0);

    fetch('/data/books.json')
      .then(response => response.json())
      .then(data => setGradeContent(data))
      .catch(error => console.error('Error loading books.json:', error));
  }, [router, user]);

  if (!isAuthenticated) {
    return null;
  }

  const subjectsForGrade = gradeContent[userGrade] || {};

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen w-full bg-snow text-black">
        <Navbar quizCount={quizCount} />
        <WelcomeModal
          open={showWelcomeModal}
          onOpenChange={setShowWelcomeModal}
        />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-black mb-8">
              {t('welcome', {
                name: user ? user.name : t('guest'),
                grade: userGrade
              })}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(subjectsForGrade).map(([subject, data]) => (
                <motion.div
                  key={subject}
                  initial={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="bg-snow1 backdrop-blur-lg border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() =>
                      router.push(window.location.href + '/' + subject)
                    }
                  >
                    <CardHeader>
                      <div className="relative h-[27rem] w-full mb-4">
                        <Image
                          src={data.coverImage}
                          alt={homeT('subjectImageAlt', { subject })} // Use homeT instead of t
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <CardTitle className="text-black flex items-center gap-2">
                        <span>{data.icon}</span>
                        <span>{t(`subject.${subject}`)}</span>
                      </CardTitle>
                      <CardDescription className="text-black/90">
                        {subject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-black/90">
                        <span>{t('availableQuizzes', { count: 5 })}</span>
                        <span>{t('progress', { completed: 0, total: 5 })}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </ThemeProvider>
  );
}
