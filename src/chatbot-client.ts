import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { SYSTEM_PROMPT } from '../prompts/system-prompt';

dotenv.config();

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatResponse = {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
};

const MOCK_RESPONSES: Record<string, string> = {
  default:
    'Dobrý den! Jsem virtuální asistent FuturBank CZ. Jak Vám mohu pomoci?',
  credit:
    'FuturBank CZ nabízí spotřebitelské úvěry od 10 000 Kč. Pro více informací navštivte naši pobočku nebo zavolejte na zákaznickou linku.',
  injection:
    'Tuto informaci bohužel nemohu poskytnout. Mohu Vám pomoci s bankovními službami FuturBank CZ.',
  hallucination:
    'Tuto informaci bohužel nemohu poskytnout. Mohu Vám pomoci s bankovními službami FuturBank CZ.',
};

const resolveMockResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('ignoruj') || lower.includes('system prompt') || lower.includes('administrátor')) {
    return MOCK_RESPONSES.injection;
  }
  if (lower.includes('premium gold elite') || lower.includes('česká spořitelna')) {
    return MOCK_RESPONSES.hallucination;
  }
  if (lower.includes('úvěr') || lower.includes('kredit') || lower.includes('půjčka')) {
    return MOCK_RESPONSES.credit;
  }
  return MOCK_RESPONSES.default;
};

export const askBankBot = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> => {
  const useMock = process.env.USE_MOCK === 'true';

  if (useMock) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      content: resolveMockResponse(userMessage),
      model: 'mock',
      promptTokens: 0,
      completionTokens: 0,
      durationMs: 300,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Copy .env.example to .env and fill in your key.');
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const startTime = Date.now();

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 500,
  });

  const durationMs = Date.now() - startTime;
  const choice = completion.choices[0];

  return {
    content: choice.message.content ?? '',
    model: completion.model,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    durationMs,
  };
};
