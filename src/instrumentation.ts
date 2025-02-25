import { registerOTel } from '@vercel/otel';
import { Client } from 'langsmith';
import { AISDKExporter } from 'langsmith/vercel';

const { LANGSMITH_API_KEY, LANGCHAIN_ENDPOINT } = process.env;

export function register() {
  const langsmithClient = new Client({
    apiKey: LANGSMITH_API_KEY || '',
    apiUrl: LANGCHAIN_ENDPOINT || ''
  });

  registerOTel({
    serviceName: 'langsmith-vercel-ai-sdk-example',
    traceExporter: new AISDKExporter({ client: langsmithClient, debug: true })
  });
}
