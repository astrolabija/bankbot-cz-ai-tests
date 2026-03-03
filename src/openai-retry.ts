import OpenAI from 'openai';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  const maybeStatus = (error as { status?: number })?.status;
  if (maybeStatus && [408, 409, 429, 500, 502, 503, 504].includes(maybeStatus)) {
    return true;
  }

  const maybeCode = (error as { code?: string })?.code;
  if (maybeCode && ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'].includes(maybeCode)) {
    return true;
  }

  return false;
};

export const createChatCompletionWithRetry = async (
  client: OpenAI,
  request: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
  maxRetries = 3
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      return await client.chat.completions.create(request);
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const baseDelayMs = 400 * 2 ** attempt;
      const jitterMs = Math.floor(Math.random() * 200);
      await sleep(baseDelayMs + jitterMs);
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown OpenAI API error');
};
