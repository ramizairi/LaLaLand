export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export type QuizInstruction = {
  numberQuestions: number;
  focus: 'general' | 'tecnictal' | 'theoretical';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  questionType: QuestionType;
  instruction: string;
  docs?: string;
  language: Languages;
};

export interface QuizQuestion {
  question: string;
  options: string[];
  type: QuestionType;
  answer: string | string[];
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface GenerateQuiz {
  quiz: Quiz;
  title: string;
}

export enum Models {
  O1Preview = 'o1-preview',
  O1mini = 'o1-mini',
  GPT4o = 'gpt-4o',
  GPT4oMini = 'gpt-4o-mini',
  Gemini15ProLatest = 'gemini-1.5-pro-latest',
  GeminiFlash15 = 'gemini-1.5-flash-latest'
}

export interface Options {
  apiKey: string;
  model: Models;
  isFree?: boolean;
  language?: Languages;
}

export enum QuestionType {
  MultipleChoiceSingle = 'multiple-choice-single',
  MultipleChoice = 'multiple-choice',
  TrueOrFalse = 'true-or-false',
  OpenEnded = 'open-ended'
}

export type UserAnswer = {
  index: number;
  question: string;
  isCorrect: boolean;
  selectedOptions: string[];
};

export enum Languages {
  French = 'French',
  English = 'English',
  Arabic = 'Arabic'
}

export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  DOCX = 'docx',
  TXT = 'txt'
}
