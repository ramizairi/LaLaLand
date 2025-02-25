'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CheckCircle, Sparkles, Target, Zap } from 'lucide-react';
import {
  GenerateQuiz,
  Languages,
  Models,
  Options,
  QuestionType
} from '@/lib/types';
import { generateQuiz, generateQuizBasedImage } from '@/actions/generate-quiz';
import { FileType, usePDF } from '@/store/store';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { dictionaryQuestionType, cn, compressImage } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface QuizGeneratorProps {
  onGenerate: (questions: GenerateQuiz) => void;
  selectedImagePath?: string | null;
}

export default function QuizGenerator({ onGenerate }: QuizGeneratorProps) {
  type QuizStep =
    | 'generate'
    | 'intro'
    | 'quiz'
    | 'results'
    | 'upload'
    | 'books';

  const { setUploadedPDF, setTypeFile } = usePDF();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<QuizStep>('books');
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations('QuizConfig');
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [focus, setFocus] = useState<'general' | 'tecnictal' | 'theoretical'>(
    'general'
  );
  const [difficulty, setDifficulty] = useState('Meduim');
  const [questionType, setQuestionType] = useState<QuestionType>(
    QuestionType.MultipleChoiceSingle
  );
  const [pdfContent, setPdfContent] = useState('');
  const { uploadedPDF, typeFile } = usePDF();
  const [pdfContentError, setPdfContentError] = useState('');
  const locale = useLocale();

  const validatePdfContent = () => {
    if (!pdfContent.trim()) {
      setPdfContentError(t('topicsPlaceholder'));
      return false;
    }
    setPdfContentError('');
    return true;
  };

  const handleQuizGeneration = (
    generateFunction: Promise<GenerateQuiz | undefined>
  ) => {
    generateFunction
      .then((questions: GenerateQuiz | undefined) => {
        if (questions) {
          onGenerate(questions);
          toast.success(t('generateButton'));
        } else {
          toast.error(t('errorGeneratingQuiz'));
          console.error('Failed to generate questions');
        }
      })
      .catch(err => {
        toast.error(t('errorGeneratingQuiz'));
        console.error('Error generating quiz:', err);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const handleGenerate = async () => {
    if (!validatePdfContent()) return;

    if (uploadedPDF) {
      const formData = new FormData();
      if (typeFile === FileType.PDF) {
        formData.append('file', uploadedPDF);
      }
      formData.append('question', pdfContent);
      formData.append('numberQuestions', numQuestions.toString());
      formData.append('focus', focus);
      formData.append('difficulty', difficulty);
      formData.append('questionType', questionType);

      const quizCount =
        typeof window !== 'undefined'
          ? parseInt(localStorage.getItem('quizCount') || '0')
          : 0;
      const isFree = quizCount < 5 || !!localStorage.getItem('apiKey');

      const config: Options = {
        apiKey: window.localStorage.getItem('apiKey') || '',
        model: window.localStorage.getItem('model') as Models,
        isFree,
        language:
          locale === 'en'
            ? Languages.English
            : locale === 'fr'
              ? Languages.French
              : Languages.Arabic
      };

      setIsGenerating(true);

      if (typeFile === FileType.IMAGE) {
        try {
          const compressedImage = await compressImage(uploadedPDF as File);
          const reader = new FileReader();
          reader.readAsDataURL(compressedImage);
          reader.onload = function () {
            const base64Image = reader.result as string;
            handleQuizGeneration(
              generateQuizBasedImage(formData, base64Image, config)
            );
          };
          reader.onerror = () => {
            throw new Error('Failed to read image file');
          };
        } catch (error) {
          toast.error(t('errorProcessingImage'));
          setIsGenerating(false);
          console.error('Error processing image:', error);
        }
      } else {
        handleQuizGeneration(generateQuiz(formData, config));
      }
    }
  };
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

  return (
    <div className="min-h-screen bg-snow text-black">
      <div className="max-w-7xl mx-auto sm:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
              <p className="text-gray-400">{t('description')}</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="pdf-content">{t('topicsQuestion')}</Label>
              <Textarea
                id="pdf-content"
                placeholder={t('topicsPlaceholder')}
                value={pdfContent}
                onChange={e => {
                  setPdfContent(e.target.value);
                  if (pdfContentError) setPdfContentError('');
                }}
                className={cn(
                  'bg-peach text-black border-0 min-h-[100px] max-h-[210px] placeholder:text-black/60',
                  pdfContentError && 'border-2 border-red-500'
                )}
              />
              {pdfContentError && (
                <p className="text-sm text-red-500">{pdfContentError}</p>
              )}
            </div>
            <div className="bg-peach rounded-lg p-6 space-y-6">
              <div className="space-y-4">
                <Label>{t('questionCount')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[3, 5, 10, 15].map(num => (
                    <div
                      key={num}
                      className={cn(
                        'cursor-pointer rounded-lg p-4 text-center transition-colors font-bold',
                        numQuestions === num
                          ? 'bg-snow text-black'
                          : 'bg-snow1/50 hover:bg-snow1/80'
                      )}
                      onClick={() => setNumQuestions(num)}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="question-type">{t('questionType')}</Label>
                <Select
                  value={questionType}
                  onValueChange={(value: string) =>
                    setQuestionType(value as QuestionType)
                  }
                >
                  <SelectTrigger
                    id="question-type"
                    className="bg-snow1 border-0"
                  >
                    <SelectValue
                      placeholder={t('options.selectQuestionType')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={QuestionType.MultipleChoiceSingle}>
                      {t('options.questionTypeOption')}
                    </SelectItem>
                    <SelectItem value={QuestionType.MultipleChoice}>
                      {t('options.multipleChoice')}
                    </SelectItem>
                    <SelectItem value={QuestionType.TrueOrFalse}>
                      {t('options.trueOrFalse')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="focus">{t('quizFocus')}</Label>
                <Select
                  value={focus}
                  onValueChange={(value: string) =>
                    setFocus(value as 'general' | 'tecnictal' | 'theoretical')
                  }
                >
                  <SelectTrigger id="focus" className="bg-snow1 border-0">
                    <SelectValue placeholder={t('options.selectFocus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {t('options.general')}
                    </SelectItem>
                    <SelectItem value="tecnictal">
                      {t('options.technical')}
                    </SelectItem>
                    <SelectItem value="theoretical">
                      {t('options.theoretical')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="difficulty">
                  {t('options.selectDifficulty')}
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="bg-snow1 border-0">
                    <SelectValue placeholder={t('options.selectDifficulty')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">{t('options.easy')}</SelectItem>
                    <SelectItem value="Meduim">
                      {t('options.medium')}
                    </SelectItem>
                    <SelectItem value="Hard">{t('options.hard')}</SelectItem>
                    <SelectItem value="Expert">
                      {t('options.expert')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-peach text-black hover:bg-peach/60"
            >
              {isGenerating ? t('generatingQuestions') : t('generateButton')}
            </Button>
          </div>

          {/* Right Column - Preview and Features */}
          <div className="lg:pl-8">
            <div className="bg-peach rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-black/80" />
                <h2 className="text-xl font-bold">{t('aiFeatures.title')}</h2>
              </div>

              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold">
                  {t('aiFeatures.characteristics')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-6 text-black/80 mt-1" />
                    <div>
                      <p className="font-medium">
                        {t('aiFeatures.intelligentQuestions.title')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('aiFeatures.intelligentQuestions.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-6 text-black/80 mt-1" />
                    <div>
                      <p className="font-medium">
                        {t('aiFeatures.adaptability.title')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('aiFeatures.adaptability.description')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-6 text-black/80 mt-1" />
                    <div>
                      <p className="font-medium">
                        {t('aiFeatures.personalizedApproach.title')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('aiFeatures.personalizedApproach.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  {t('preview.title')}
                </h3>
                <div className="bg-snow1 rounded-lg p-4 space-y-4">
                  <p className="font-medium">{t('preview.currentConfig')}</p>
                  <ul className="list-disc list-inside text-sm text-gray-400">
                    <li>
                      {t('preview.questionCount')}: {numQuestions}
                    </li>
                    <li>
                      {t('preview.focus')}: {focus}
                    </li>
                    <li>
                      {t('preview.difficulty')}: {difficulty}
                    </li>
                    <li>
                      {t('preview.questionType')}:{' '}
                      {dictionaryQuestionType(questionType)}
                    </li>
                  </ul>
                  <p className="text-sm text-gray-400">
                    {t('preview.summary')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
