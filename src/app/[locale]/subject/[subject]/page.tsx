'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import QuizGenerator from '@/components/sections/quiz-generator';
import QuizQuestion from '@/components/sections/quiz-question';
import QuizResults from '@/components/sections/quiz-results';
import QuizIntro from '@/components/sections/quiz-intro';
import {
  GenerateQuiz,
  QuizQuestion as QuizQuestions,
  UserAnswer,
  FileType
} from '@/lib/types';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { Navbar } from '@/components/navbar';
import { ErrorModal } from '@/components/modals/error-modal';
import { usePDF } from '@/store/store';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

interface BookDetails {
  paths: string[];
}

interface BookDetailsPageProps {
  params: {
    subject: string;
  };
}

type QuizStep = 'generate' | 'intro' | 'quiz' | 'results' | 'upload' | 'books';

export default function BookDetailsPage({ params }: BookDetailsPageProps) {
  const router = useRouter();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations('subjectSelection');
  const locale = useLocale();

  // Access the PDF store
  const { setUploadedPDF, setTypeFile } = usePDF();

  const [step, setStep] = useState<QuizStep>('books');
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [title, setTitle] = useState<string>('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/en/login');
      return;
    }

    const fetchBookData = async () => {
      try {
        if (!params?.subject) throw new Error('Subject parameter is missing');

        const booksResponse = await fetch('/data/books.json');
        const booksData = await booksResponse.json();

        const userData = JSON.parse(user);
        const userGrade = userData?.gradeLevel || '5';

        if (!booksData[userGrade])
          throw new Error(`No data for grade ${userGrade}`);

        const subjectData = booksData[userGrade][params.subject];
        if (!subjectData?.data)
          throw new Error(`No book reference for ${params.subject}`);

        const detailsResponse = await fetch('/data/BooksDetails.json');
        if (!detailsResponse.ok) throw new Error('Failed to load book details');

        const detailsData = await detailsResponse.json();
        const bookDetails = detailsData[subjectData.data];
        if (!bookDetails) throw new Error('Book details not found');

        setBookDetails(bookDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load book details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();

    // Quiz initialization
    const firstVisit = !localStorage.getItem('welcomeShown');
    if (firstVisit) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }
    const storedCount = localStorage.getItem('quizCount');
    setQuizCount(storedCount ? parseInt(storedCount) : 0);
    setApiKey(localStorage.getItem('apiKey'));
  }, [params, router, setUploadedPDF, setTypeFile]);

  // Function to convert image URL to File object
  const imageUrlToFile = async (
    imageUrl: string,
    filename: string
  ): Promise<File> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const updateProgress = () => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      };

      const progressInterval = setInterval(updateProgress, 200);

      // Fetch the image
      const response = await fetch(`/books/${imageUrl}`);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create a File object from the blob
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      throw error;
    }
  };

  const handleImageClick = async (path: string) => {
    setIsUploading(true);

    try {
      // Get the filename from the path
      const filename = path.split('/').pop() || 'image.jpg';

      // Convert the image URL to a File object
      const imageFile = await imageUrlToFile(path, filename);

      // Store the file in the global state
      setUploadedPDF(imageFile);
      setTypeFile(FileType.IMAGE);

      // Move to the generate step
      setStep('generate');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuizGenerated = (generatedQuestions: GenerateQuiz) => {
    if (quizCount >= 5 && !apiKey) {
      setErrorModalOpen(true);
      return;
    }

    setQuestions(generatedQuestions.quiz.questions);
    setTitle(generatedQuestions.title);
    setUserAnswers(
      generatedQuestions.quiz.questions.map((question, index) => ({
        index: index,
        question: question.question,
        selectedOptions: [],
        isCorrect: false
      }))
    );
    setStep('intro');

    const newCount = quizCount + 1;
    setQuizCount(newCount);
    localStorage.setItem('quizCount', newCount.toString());
  };

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setStep('quiz');
  };

  const handleQuestionAnswer = (
    isCorrect: number,
    selectedOptions: string[]
  ) => {
    const newUserAnswers = [...userAnswers];
    const currentQuestion = newUserAnswers[currentQuestionIndex];
    currentQuestion.isCorrect = !!isCorrect;
    currentQuestion.selectedOptions = selectedOptions;
    setUserAnswers(newUserAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Card className="bg-red-900/50 border-red-700 p-6 max-w-md text-center">
          <p className="text-xl mb-4">Error: {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md"
          >
            {t('back')}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-snow text-black">
      <Navbar quizCount={quizCount} />
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
      />
      <ErrorModal
        open={errorModalOpen}
        onOpenChange={setErrorModalOpen}
        setStep={setStep}
      />

      <div className="container mx-auto p-6">
        {step === 'books' && (
          <div className="space-y-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-peach hover:bg-peach/90 rounded-md flex items-center gap-2"
            >
              ← {t('back')}
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bookDetails?.paths.map((path, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="bg-gray-800/50 backdrop-blur-lg border-gray-700 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleImageClick(path)}
                  >
                    <CardContent className="p-2">
                      <div className="relative w-full h-[26rem]">
                        <Image
                          src={`/books/${path}`}
                          alt={`Page ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex justify-between">
                        <p className="text-s text-black">{t('page')}</p>
                        <p className="text-s text-black">{index + 1}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Processing Image</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-center">{uploadProgress}%</p>
            </Card>
          </div>
        )}

        {step === 'generate' && (
          <QuizGenerator onGenerate={handleQuizGenerated} />
        )}
        {step === 'intro' && (
          <QuizIntro
            totalQuestions={questions.length}
            onStart={handleStartQuiz}
          />
        )}
        {step === 'quiz' && (
          <QuizQuestion
            title={title}
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleQuestionAnswer}
            onNext={handleNextQuestion}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setStep={setStep}
            onSkip={handleNextQuestion}
          />
        )}
        {step === 'results' && (
          <QuizResults
            title={title}
            questions={questions}
            userAnswers={userAnswers}
            setStep={setStep}
          />
        )}
      </div>
    </div>
  );
}
