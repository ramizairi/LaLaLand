'use client';
import { Check, Sparkles, X, Repeat, Facebook, BadgePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizNavbar } from '../quiz-navbar';
import { QuestionType, type QuizQuestion, type UserAnswer } from '@/lib/types';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface QuizResultsProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  title: string;
  setStep: Dispatch<
    SetStateAction<
      'upload' | 'generate' | 'intro' | 'quiz' | 'results' | 'books'
    >
  >;
}

export default function QuizResults({
  questions,
  userAnswers,
  title,
  setStep
}: QuizResultsProps) {
  const t = useTranslations('QuizResults');
  const jsConfettiRef = useRef<{
    addConfetti: (options: { emojis: string[] }) => void;
  } | null>(null);

  const checkAnswer = (userAnswer: UserAnswer) => {
    return userAnswer.isCorrect;
  };

  const rightAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const percentage = ((rightAnswers / questions.length) * 100).toFixed(1);

  const showConfetti = () => {
    jsConfettiRef.current?.addConfetti({
      emojis: ['🎉', '🎊', '🎈', '🥳', '👏']
    });
  };

  const shareOnFacebook = () => {
    const url = 'https://www.facebook.com/sharer/sharer.php';
    const text = `I scored ${percentage} percent on the quiz "${title}"! 🎉🎉🎉\n\n
                  I got ${rightAnswers} correct answers out of ${questions.length} questions.\n\n`;
    const facebookUrl = `${url}?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank');
  };

  useEffect(() => {
    // Dynamically import JSConfetti only on client side
    const initConfetti = async () => {
      try {
        const JSConfetti = (await import('js-confetti')).default;
        const canvas = document.querySelector(
          '#page-results'
        ) as HTMLCanvasElement;
        if (canvas) {
          jsConfettiRef.current = new JSConfetti({ canvas });
          // Show confetti if score is >= 80%
          if (parseFloat(percentage) >= 80) {
            showConfetti();
          }
        }
      } catch (error) {
        console.error('Failed to load confetti:', error);
      }
    };

    initConfetti();
  }, [percentage]);

  return (
    <div className="max-w-4xl mx-auto pt-4 mb-14 sm:mb-0" id="page-results">
      {/* Header */}
      <QuizNavbar
        title={title}
        questionNumber={questions.length}
        totalQuestions={questions.length}
      />

      {/* Progress bar */}
      <div className="h-1 bg-gray-800 rounded mb-8">
        <div className="quiz-progressbar" />
      </div>

      {/* Summary */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-black-300">{t('title')}</h1>
        <p className="text-gray-800 mt-2">{t('description')}</p>

        <div className="flex justify-between">
          <div className="flex flex-col items-start mt-4">
            <span className="text-gray-700 text-[2.5rem] md:text-[4rem] md:tracking-[-5px] font-extrabold">
              {rightAnswers} / {questions.length}
            </span>
            <span className="text-gray-800">{t('score.correct')}</span>
          </div>

          <div className="flex flex-col items-start mt-4">
            <span className="text-gray-700 text-[2.5rem] md:text-[4rem] font-extrabold">
              {percentage}%
            </span>
            <span className="text-gray-800">{t('score.percentage')}</span>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-8">
        {questions.map((question, index) => {
          const isCorrect = checkAnswer(userAnswers[index]);
          const selectedOptions = userAnswers[index].selectedOptions;

          return (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-800">{index + 1}.</span>
                <h2 className="text-gray-700">{question.question}</h2>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'bg-peach rounded-lg p-4 flex items-center gap-4 w-full ',
                    isCorrect ? 'bg-green text-white' : 'bg-red-700'
                  )}
                >
                  {question.type !== QuestionType.OpenEnded && (
                    <div className="space-y-2">
                      {selectedOptions.map(option => (
                        <p className="text-white" key={option}>
                          {option}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                {isCorrect ? (
                  <div className="ml-4">
                    <Check className="w-8 h-8 text-green" />
                  </div>
                ) : (
                  <div className="ml-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                )}
              </div>
              {!isCorrect && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="hover:bg-peach hover:text-black text-black"
                    onClick={() => {
                      const explanationElement = document.getElementById(
                        `explanation-${index}`
                      );
                      if (explanationElement) {
                        explanationElement.style.display =
                          explanationElement.style.display === 'none'
                            ? 'block'
                            : 'none';
                      }
                    }}
                  >
                    {t('actions.why')}
                    <Sparkles className="w-6 h-6 ml-2 text-gray-900" />
                  </Button>

                  <div
                    id={`explanation-${index}`}
                    className="border border-orange rounded-lg p-[20px]"
                    style={{ display: 'none' }}
                  >
                    {question.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between mt-8 flex-col gap-4 sm:gap-0 sm:flex-row pb-16">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="border-gray-700 bg-white hover:bg-orange text-gray-800 hover:text-white"
            onClick={() => setStep('intro')}
          >
            <Repeat />
            {t('actions.retry')}
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            onClick={shareOnFacebook}
          >
            <Facebook />
            {t('actions.share')}
          </Button>
        </div>

        <Button
          className="bg-white text-black hover:bg-gray-200"
          onClick={() => setStep('generate')}
        >
          <BadgePlus />
          {t('actions.generate')}
        </Button>
      </div>
    </div>
  );
}
