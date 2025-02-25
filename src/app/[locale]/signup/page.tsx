'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import SignupForm from '@/components/sections/signup-form';
import { Navbar } from '@/components/navbar';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name: string;
  gradeLevel: string;
  createdAt: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Signup');

  useEffect(() => {
    const firstVisit = !localStorage.getItem('welcomeShown');
    if (firstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }

    // Check for existing auth state
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            // Update localStorage with fresh data from Firestore
            localStorage.setItem('user', JSON.stringify(userData));
            router.push('/en/subject');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error(t('errorFetchingData'));
        }
      }
    });

    return () => unsubscribe();
  }, [router, t]);

  const saveUserData = async (
    userId: string,
    email: string,
    name: string,
    gradeLevel: string
  ) => {
    try {
      const userData = {
        email,
        name,
        gradeLevel,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Save to localStorage for immediate access
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userId,
          ...userData
        })
      );

      router.push('/quiz');
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    name: string,
    gradeLevel: string
  ) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await saveUserData(userCredential.user.uid, email, name, gradeLevel);
      toast.success(t('signupSuccess'));
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(t('signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const userData = {
        email: result.user.email!,
        name: result.user.displayName || 'Default Name',
        gradeLevel: '1' // Default grade level
      };
      await saveUserData(
        result.user.uid,
        userData.email,
        userData.name,
        userData.gradeLevel
      );
      toast.success(t('googleSignupSuccess'));
    } catch (error) {
      console.error('Google Sign-up error:', error);
      toast.error(t('googleSignupError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="relative min-h-screen w-full bg-snow">
        {/* Rest of the JSX remains the same */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[100%] opacity-50">
            <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-peach blur-3xl" />
            <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-snow1 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-snow1 blur-3xl" />
          </div>
        </div>

        <Navbar quizCount={1} />

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
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <h1 className="text-3xl font-bold bg-clip-text text-black">
                    {t('title')}
                  </h1>
                  <p className="mt-2 text-gray-400">{t('welcomeMessage')}</p>
                </motion.div>
              </CardHeader>
              <CardContent className="p-6">
                <Button
                  variant="outline"
                  className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <Image
                    src="/google-logo.png"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {t('signUpWithGoogle')}
                </Button>

                <div className="relative mb-6">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 text-sm text-gray-400">
                    {t('or')}
                  </div>
                </div>

                <SignupForm onSubmit={handleSignup} />

                <div className="mt-6 text-center text-sm text-gray-400">
                  <a
                    href="/signin"
                    className="hover:text-white transition-colors"
                  >
                    {t('alreadyHaveAccount')}
                  </a>
                  <span className="mx-2">•</span>
                  <a
                    href="/forgot-password"
                    className="hover:text-white transition-colors"
                  >
                    {t('forgotPassword')}
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
