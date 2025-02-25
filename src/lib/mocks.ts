import { GenerateQuiz, QuestionType } from './types';

export const generatedQuiz: GenerateQuiz = {
  title: 'Test Quiz',
  quiz: {
    questions: [
      {
        question: 'Which of the following are programming languages?',
        options: ['Python', 'HTML', 'JavaScript', 'CSS'],
        type: QuestionType.MultipleChoice,
        answer: ['Python', 'JavaScript'],
        explanation:
          'Python and JavaScript are programming languages, while HTML and CSS are markup and style sheet languages respectively.'
      },
      {
        question: 'Which of the following are web browsers?',
        options: ['Firefox', 'Chrome', 'Safari', 'iOS'],
        type: QuestionType.MultipleChoice,
        answer: ['Firefox', 'Chrome', 'Safari'],
        explanation: 'Firefox, Chrome, Safari, and Opera are all web browsers.'
      },
      {
        question: 'Which of the following are front-end frameworks?',
        options: ['React', 'Vue', 'Angular', 'Express'],
        type: QuestionType.MultipleChoice,
        answer: ['React', 'Vue', 'Angular'],
        explanation:
          'React, Vue, and Angular are front-end frameworks, while Express is a back-end framework.'
      },
      {
        question: 'Which of the following are back-end frameworks?',
        options: ['Express', 'Django', 'Flask', 'React'],
        type: QuestionType.MultipleChoice,
        answer: ['Express', 'Django', 'Flask'],
        explanation:
          'Express, Django, and Flask are back-end frameworks, while React is a front-end framework.'
      }
    ]
  }
};

export const oneRightOptionQuiz: GenerateQuiz = {
  title: 'Test Quiz',
  quiz: {
    questions: [
      {
        question: 'Which of the following are programming languages?',
        options: ['Python', 'HTML', 'Write in paper', 'CSS'],
        type: QuestionType.MultipleChoiceSingle,
        answer: ['Python'],
        explanation: 'Python is a programming language.'
      },
      {
        question: 'Which of the following are web browsers?',
        options: ['Firefox', 'ChromeOS', 'Windows', 'iOS'],
        type: QuestionType.MultipleChoiceSingle,
        answer: ['Firefox'],
        explanation: 'Firefox is a web browser.'
      },
      {
        question: 'Which of the following are front-end frameworks?',
        options: ['React', 'Hono', 'React Native', 'Express'],
        type: QuestionType.MultipleChoiceSingle,
        answer: ['React'],
        explanation: 'React is a front-end framework.'
      },
      {
        question: 'Which of the following are back-end frameworks?',
        options: ['Express', 'Angular', 'Vue', 'React'],
        type: QuestionType.MultipleChoiceSingle,
        answer: ['Express'],
        explanation: 'Express is a back-end framework.'
      }
    ]
  }
};

export const falseOrTrueQuiz: GenerateQuiz = {
  quiz: {
    questions: [
      {
        question:
          'تونس هي الدولة العربية الوحيدة التي لديها دستور يعود تاريخه إلى عام 1861.',
        options: ['صحيح', 'خطأ'],
        answer: ['صحيح'],
        explanation:
          'صحيح، تونس لديها أول دستور عربي حديث يعود إلى عام 1861، مما يجعلها رائدة في هذا المجال.',
        type: QuestionType.TrueOrFalse
      },
      {
        question: 'تونس هي أكبر منتج لزيت الزيتون في العالم.',
        options: ['صحيح', 'خطأ'],
        answer: ['خطأ'],
        explanation:
          'خطأ، تونس هي واحدة من أكبر المنتجين لزيت الزيتون في العالم، ولكنها ليست الأكبر. إسبانيا تحتل المرتبة الأولى.',
        type: QuestionType.TrueOrFalse
      },
      {
        question:
          'الثورة التونسية عام 2011 أدت إلى الإطاحة بالرئيس زين العابدين بن علي.',
        options: ['صحيح', 'خطأ'],
        answer: ['صحيح'],
        explanation:
          'صحيح، الثورة التونسية عام 2011، المعروفة أيضًا باسم ثورة الياسمين، أدت إلى الإطاحة بالرئيس زين العابدين بن علي.',
        type: QuestionType.TrueOrFalse
      },
      {
        question: 'تونس تقع في شمال إفريقيا وتطل على المحيط الأطلسي.',
        options: ['صحيح', 'خطأ'],
        answer: ['خطأ'],
        explanation:
          'خطأ، تونس تقع في شمال إفريقيا ولكنها تطل على البحر الأبيض المتوسط وليس المحيط الأطلسي.',
        type: QuestionType.TrueOrFalse
      },
      {
        question: 'مدينة قرطاج التونسية كانت عاصمة للإمبراطورية الرومانية.',
        options: ['صحيح', 'خطأ'],
        answer: ['خطأ'],
        explanation:
          'خطأ، قرطاج كانت مدينة مهمة في العصر الروماني، ولكنها لم تكن عاصمة للإمبراطورية الرومانية.',
        type: QuestionType.TrueOrFalse
      }
    ]
  },
  title: 'اختبار عن تونس'
};
