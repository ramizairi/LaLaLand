'use server';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { Document } from '@langchain/core/documents';
import type { GenerateQuiz, Options, QuizInstruction } from '@/lib/types';
import { Languages, Models, QuestionType } from '@/lib/types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { dictionaryQuestionType } from '@/lib/utils';
import { AISDKExporter } from 'langsmith/vercel';

const generateSystemPrompt = ({
  numberQuestions,
  focus,
  difficulty,
  instruction,
  docs,
  questionType,
  language
}: QuizInstruction): string => {
  return `Act as an expert professor with many years of experience in any subject.
   Your goal is to create a quiz with the following characteristics:
  - The questions should be about: ${instruction}
  - ${numberQuestions} questions
  - Focused on ${focus}
  - Difficulty level: ${difficulty}
  - There are four types of questions: True or False, single-answer multiple choice, multiple-answer multiple choice. The question type should be: "${dictionaryQuestionType(questionType)}".
  - When the question type is "True or False," the answers should be "True" or "False."
  - When the question type is "Multiple Choice," there should be four answer options, and it should not include the option "All of the above."
  - The quiz should be generated in the language "${language}".
  This is the content of the PDF from which the questions are generated:
  "${docs}"`;
};

const generateSystemPromptImage = ({
  numberQuestions,
  focus,
  difficulty,
  instruction,
  questionType,
  language
}: QuizInstruction) => {
  return `Act as an expert professor with many years of experience in any subject.
  Your goal is to create a quiz with the following characteristics:
  - The questions should be about: ${instruction}
  - ${numberQuestions} questions
  - Focused on: ${focus}
  - Difficulty level: ${difficulty}
  - There are four types of questions: True or False, single-answer multiple choice, multiple-answer multiple choice. The question type should be: "${dictionaryQuestionType(questionType)}".
  - When the question type is "True or False," the answers should be "True" or "False."
  - When the question type is "Multiple Choice," there should be four answer options, and it should not include the option "All of the above."
  - The content you must base the quiz on is the image provided by the user.
  - The quiz should be generated in the language "${language}".`;
};

type GenerateQuizParams = {
  numberQuestions: number;
  focus: 'general' | 'tecnictal' | 'theoretical';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  questionType: QuestionType;
};

const getModelEmbeddings = (config: Options) => {
  if (config.model === Models.GPT4o || config.model === Models.GPT4oMini) {
    console.log('Using OpenAI model');

    const model = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
      apiKey: config.apiKey
    });

    return model;
  }

  console.log('Using Google model');

  const model = new GoogleGenerativeAIEmbeddings({
    model: 'text-embedding-004',
    apiKey: config.apiKey
  });

  return model;
};

const getModel = (config: Options) => {
  if (
    config.model === Models.Gemini15ProLatest ||
    config.model === Models.GeminiFlash15
  ) {
    const apiKey = config.isFree
      ? process.env.GOOGLE_GEMINI_API || ''
      : config.apiKey;
    const google = createGoogleGenerativeAI({ apiKey });
    const model = google(config.model);
    return model;
  }

  const openai = createOpenAI({ apiKey: config.apiKey });
  const model = openai(`${config.model}`);
  return model;
};

export const generateQuiz = async (
  data: FormData,
  config: Options
): Promise<GenerateQuiz | undefined> => {
  const pdfFile = data.get('file');
  const instruction = data.get('question') as string | null;
  const numberQuestions = Number(data.get('numberQuestions'));
  const focus = data.get('focus') as GenerateQuizParams['focus'];
  const difficulty = data.get('difficulty') as GenerateQuizParams['difficulty'];
  const questionType = data.get(
    'questionType'
  ) as GenerateQuizParams['questionType'];

  if (!pdfFile) {
    console.error('No file found in form data');
    return;
  }

  try {
    //Load the PDF file
    const loader = new PDFLoader(pdfFile);
    const docs = await loader.load();

    // Split the documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    const defaultModelEmbeddings = {
      model: Models.Gemini15ProLatest,
      apiKey: process.env.GOOGLE_GEMINI_API || ''
    };

    // Embeddings
    const embeddings = getModelEmbeddings(
      config.isFree ? defaultModelEmbeddings : config
    );

    // Vector Store
    const inMemoryVectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs, // Documents to embed
      embeddings // Embeddings from the model
    );

    // Obtain similarity search results
    // Retrieve the documents
    const vectorStoreRetriever = inMemoryVectorStore.asRetriever({
      k: 2,
      searchType: 'similarity'
    });

    // Get the documents
    const retrievedDocuments: Document[] = await vectorStoreRetriever.invoke(
      `Search for information about ${instruction}`
    );
    const result = retrievedDocuments.map(doc => doc.pageContent).join('\n');

    const defaultModel = {
      model: Models.Gemini15ProLatest,
      apiKey: process.env.GOOGLE_GEMINI_API || ''
    };

    const model = config.isFree ? getModel(defaultModel) : getModel(config);

    const { object } = await generateObject({
      model: model,
      schema: z.object({
        quiz: z.object({
          questions: z.array(
            z.object({
              question: z.string(),
              options: z
                .array(z.string())
                .describe(
                  'Four answer options. These must be different and should not have an "All of the above" option.'
                ),
              answer: z
                .array(z.string())
                .describe(
                  'Correct answer. There may be more than one correct answer, but this depends on the type of question.'
                ),
              explanation: z
                .string()
                .default('')
                .describe('Explanation of the answer as to why it is correct')
            })
          )
        }),
        title: z.string().describe('Quiz title')
      }),
      prompt: generateSystemPrompt({
        numberQuestions,
        focus,
        difficulty,
        instruction: instruction || '',
        docs: result,
        questionType,
        language: config.language || Languages.French
      }),
      // eslint-disable-next-line camelcase
      experimental_telemetry: AISDKExporter.getSettings()
    });

    const updatedQuiz = {
      ...object.quiz,
      questions: object.quiz.questions.map(question => ({
        ...question,
        type: questionType
      }))
    };

    return { quiz: updatedQuiz, title: object.title };
  } catch (error) {
    throw new Error('An error occurred generating the quiz');
  }
};

export const generateQuizBasedImage = async (
  data: FormData,
  image: string,
  config: Options
) => {
  const instruction = data.get('question') as string | null;
  const numberQuestions = Number(data.get('numberQuestions'));
  const focus = data.get('focus') as GenerateQuizParams['focus'];
  const difficulty = data.get('difficulty') as GenerateQuizParams['difficulty'];
  const questionType = data.get(
    'questionType'
  ) as GenerateQuizParams['questionType'];

  const defaultModel = {
    model: Models.Gemini15ProLatest,
    apiKey: process.env.GOOGLE_GEMINI_API || ''
  };

  const model = config.isFree ? getModel(defaultModel) : getModel(config);

  try {
    const { object } = await generateObject({
      model,
      temperature: 0.6,
      schema: z.object({
        quiz: z.object({
          questions: z.array(
            z.object({
              question: z.string(),
              options: z
                .array(z.string())
                .describe(
                  'Four answer options. These must be different and should not have an "All of the above" option.'
                ),
              answer: z
                .array(z.string())
                .describe(
                  'Correct answer. There may be more than one correct answer, but this depends on the type of question.'
                ),
              explanation: z
                .string()
                .default('')
                .describe('Explanation of the answer as to why it is correct')
            })
          )
        }),
        title: z.string().describe('Quiz title')
      }),
      system: generateSystemPromptImage({
        numberQuestions,
        focus,
        difficulty,
        instruction: instruction || '',
        questionType,
        language: config.language || Languages.French
      }),
      output: 'object',
      messages: [
        {
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: 'Genera un quiz basado en la imagen suministrada'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: image
            }
          ]
        }
      ]
    });

    const updatedQuiz = {
      ...object.quiz,
      questions: object.quiz.questions.map(question => ({
        ...question,
        type: questionType
      }))
    };

    return { quiz: updatedQuiz, title: object.title };
  } catch (error) {
    console.log('Error in actions', error);
    throw new Error('An error occurred generating the quiz');
  }
};
