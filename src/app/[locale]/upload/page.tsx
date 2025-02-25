'use client';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import PDFUploader from '@/components/sections/pdf-uploader';
import QuizGenerator from '@/components/sections/quiz-generator';
import QuizQuestion from '@/components/sections/quiz-question';
import QuizResults from '@/components/sections/quiz-results';
import QuizIntro from '@/components/sections/quiz-intro';
import {
  GenerateQuiz,
  QuizQuestion as QuizQuestions,
  UserAnswer
} from '@/lib/types';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { Navbar } from '@/components/navbar';
import { ErrorModal } from '@/components/modals/error-modal';

export default function QuizApp() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState<
    'upload' | 'generate' | 'intro' | 'quiz' | 'results' | 'books'
  >('upload');
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [title, setTitle] = useState<string>('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useEffect(() => {
    // Check authentication status
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/en/login');
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
  }, [router]);

  // If not authenticated, return null to prevent flash of content
  if (!isAuthenticated) {
    return null;
  }

  const handlePDFUpload = () => {
    setStep('generate');
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

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
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

        <div className="container mx-auto">
          {step === 'upload' && <PDFUploader onUpload={handlePDFUpload} />}
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
              onSkip={handleSkipQuestion}
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
    </ThemeProvider>
  );
}
