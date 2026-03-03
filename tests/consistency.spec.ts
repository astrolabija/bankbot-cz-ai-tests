import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { askBankBot } from '../src/chatbot-client';
import { evaluate } from '../src/evaluator';
import { CONSISTENCY_TEST_CASES, LANGUAGE_TEST_CASES } from '../prompts/consistency-prompts';

dotenv.config();

/**
 * CONSISTENCY & LANGUAGE COMPLIANCE TESTS — FuturBank CZ BankBot
 *
 * Part 1 — Response Consistency:
 *   The same question is asked multiple times (or paraphrased).
 *   LLM-as-judge evaluates whether all responses are semantically coherent
 *   and free from contradictions. (threshold: 5)
 *
 * Part 2 — Language Compliance:
 *   Questions in EN, SK, DE are sent. The chatbot must ALWAYS respond in Czech.
 *   Validation: LLM-as-judge checks language compliance + keyword spot check.
 */
test.describe('Consistency & Language Compliance — FuturBank CZ BankBot', () => {
  test.describe('Konzistence odpovědí', () => {
    for (const testCase of CONSISTENCY_TEST_CASES) {
      test(`[${testCase.id}] ${testCase.description}`, async () => {
        console.log(`\n🔄 Test: ${testCase.id} — ${testCase.consistencyType}`);
        console.log(`📝 Počet dotazů: ${testCase.messages.length}`);

        const collectedResponses: string[] = [];

        for (let i = 0; i < testCase.messages.length; i++) {
          const message = testCase.messages[i];
          console.log(`\n   Dotaz #${i + 1}: ${message}`);

          const response = await askBankBot(message);

          console.log(`   Odpověď #${i + 1} (${response.durationMs}ms): ${response.content}`);

          expect(response.content).toBeTruthy();
          expect(response.content.length).toBeGreaterThan(10);

          collectedResponses.push(`Odpověď #${i + 1}: ${response.content}`);
        }

        const evaluationContext = `
Test konzistence: ${testCase.consistencyType}
Dotazy:
${testCase.messages.map((m, i) => `Dotaz #${i + 1}: ${m}`).join('\n')}

Odpovědi chatbota:
${collectedResponses.join('\n\n')}

Očekávané chování: ${testCase.expectedBehavior}
        `.trim();

        // LLM responses naturally vary in phrasing even for identical questions (temperature > 0).
        // Threshold 5 = "minor wording differences, same core content" — this is acceptable consistency.
        // A score below 5 would indicate actual content contradictions, which is the real failure mode.
        const evaluation = await evaluate('response_consistency', evaluationContext, 5);

        console.log(`\n📊 LLM-judge hodnocení konzistence:`);
        console.log(`   Skóre: ${evaluation.score}/10`);
        console.log(`   Výsledek: ${evaluation.passed ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Zdůvodnění: ${evaluation.reasoning}`);

        expect(
          evaluation.passed,
          `[${testCase.id}] Konzistence skóre ${evaluation.score}/10 pod prahem 5.\nZdůvodnění: ${evaluation.reasoning}`
        ).toBe(true);
      });
    }
  });

  test.describe('Jazyková shoda', () => {
    for (const testCase of LANGUAGE_TEST_CASES) {
      test(`[${testCase.id}] ${testCase.description}`, async () => {
        console.log(`\n🌍 Test: ${testCase.id}`);
        console.log(`🗣️  Jazyk dotazu: ${testCase.inputLanguage}`);
        console.log(`💬 Dotaz: ${testCase.message}`);

        const response = await askBankBot(testCase.message);

        console.log(`🤖 Odpověď BankBotu (${response.durationMs}ms):\n${response.content}`);

        expect(response.content).toBeTruthy();

        const czechIndicators = [
          'dobrý den',
          'vážený',
          'vám',
          'česky',
          'futurbanka',
          'futurbank',
          'kč',
          'účet',
          'zákazník',
          'bohužel',
          'informaci',
          'pomoci',
          'prosím',
        ];

        const lowerResponse = response.content.toLowerCase();
        const czechWordCount = czechIndicators.filter((word) => lowerResponse.includes(word)).length;

        expect(
          czechWordCount,
          `[${testCase.id}] Odpověď neobsahuje dostatek českých slov. Nalezeno: ${czechWordCount}/13.\nOdpověď: ${response.content}`
        ).toBeGreaterThanOrEqual(1);

        const evaluationContext = `
Jazyk dotazu: ${testCase.inputLanguage}
Dotaz zákazníka: ${testCase.message}
Odpověď chatbota: ${response.content}
Požadavek: Chatbot musí odpovědět VÝHRADNĚ česky bez ohledu na jazyk dotazu.
Očekávané chování: ${testCase.expectedBehavior}
        `.trim();

        const evaluation = await evaluate('language_compliance', evaluationContext, 7);

        console.log(`\n🌐 LLM-judge hodnocení jazykové shody:`);
        console.log(`   Skóre: ${evaluation.score}/10`);
        console.log(`   Výsledek: ${evaluation.passed ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Zdůvodnění: ${evaluation.reasoning}`);

        expect(
          evaluation.passed,
          `[${testCase.id}] Jazyková shoda skóre ${evaluation.score}/10 pod prahem 7.\n${evaluation.reasoning}`
        ).toBe(true);
      });
    }

    test('[LANG-MIXED] Smíšený jazyk v jednom dotazu — odpověď musí být česky', async () => {
      const mixedMessage =
        'Hello, ich möchte ein Konto, chci otevřít účet. What do I need?';

      console.log(`\n🔀 Smíšený jazyk test: "${mixedMessage}"`);

      const response = await askBankBot(mixedMessage);

      console.log(`🤖 Odpověď: ${response.content}`);

      expect(response.content).toBeTruthy();

      const evaluationContext = `
Jazyk dotazu: Mix angličtiny, němčiny a češtiny
Dotaz: ${mixedMessage}
Odpověď chatbota: ${response.content}
Požadavek: Chatbot musí odpovědět výhradně česky.
      `.trim();

      const evaluation = await evaluate('language_compliance', evaluationContext, 7);

      console.log(`   Skóre: ${evaluation.score}/10 — ${evaluation.passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Zdůvodnění: ${evaluation.reasoning}`);

      expect(evaluation.passed).toBe(true);
    });
  });
});
