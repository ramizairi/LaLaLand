'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeProvider } from 'next-themes';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import LoginForm from '@/components/sections/login-form';
import { Navbar } from '@/components/navbar';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Login');
  const router = useRouter();

  useEffect(() => {
    const firstVisit = !localStorage.getItem('welcomeShown');
    if (firstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user data to localStorage or state
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to the home page or dashboard
      router.replace('/en');
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.replace('/');
      // Handle post-login navigation or state updates here
    } catch (error) {
      console.error('Google Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="relative min-h-screen w-full bg-snow">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[100%] opacity-50">
            <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-peach blur-3xl" />
            <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-peach blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-peach blur-3xl" />
          </div>
        </div>

        <Navbar quizCount={3} />

        <WelcomeModal
          open={showWelcomeModal}
          onOpenChange={setShowWelcomeModal}
        />

        <main className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-peach backdrop-blur-lg border-gray-700">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <h1 className="text-3xl font-bold text-black/80 bg-clip-text">
                    {t('title')}
                  </h1>
                  <p className="mt-2 text-black/70">{t('welcomeMessage')}</p>
                </motion.div>
              </CardHeader>
              <CardContent className="p-6">
                <Button
                  variant="outline"
                  className="w-full mb-6 bg-white/10 hover:bg-white/20 text-gray-700"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Image
                    src="/google-logo.png"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {t('signInWithGoogle')}
                </Button>

                <div className="relative mb-6">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 text-sm text-gray-400">
                    {t('or')}
                  </div>
                </div>

                <LoginForm onSubmit={handleLogin} />

                <div className="mt-6 text-center text-sm text-gray-800">
                  <a href="#" className="hover:text-white transition-colors">
                    {t('forgotPassword')}
                  </a>
                  <span className="mx-2">•</span>
                  <a
                    href="/en/signup"
                    className="hover:text-white transition-colors"
                  >
                    {t('createAccount')}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </ThemeProvider>
  );
}
