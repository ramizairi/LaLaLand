import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface QuizNavbarProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
}

export const QuizNavbar = ({
  questionNumber,
  totalQuestions,
  title
}: QuizNavbarProps) => {
  const t = useTranslations('QuizResults');

  return (
    <header className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between py-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <Image
            src={'logo/logo-simple.svg'}
            width={150}
            height={150}
            alt="Logo"
          />
        </div>
        <span className="text-gray-800">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700">
          {t('score.questionCountStart')} {questionNumber}{' '}
          {t('score.questionCountMiddle')} {totalQuestions}
        </span>
      </div>
    </header>
  );
};
