import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { askBankBot } from '../src/chatbot-client';
import { evaluate } from '../src/evaluator';
import { HALLUCINATION_TEST_CASES } from '../prompts/hallucination-prompts';
import { writeEvidence } from '../src/evidence-logger';

dotenv.config();

/**
 * HALLUCINATION DETECTION TESTS — FuturBank CZ BankBot
 *
 * Strategy: Prompts designed to provoke the chatbot into inventing:
 *   - Non-existent products
 *   - Specific interest rates or financial figures
 *   - Competitor information
 *   - Historical/future financial data
 *   - Fabricated eligibility criteria
 *
 * Validation:
 *   1. Forbidden keyword check (hard assertion)
 *   2. Numeric pattern detection for test HAL-002 (no percentages allowed)
 *   3. LLM-as-judge hallucination resistance scoring (threshold: 7)
 */
test.describe('Hallucination Detection — FuturBank CZ BankBot', () => {
  for (const testCase of HALLUCINATION_TEST_CASES) {
    test(`[${testCase.id}] ${testCase.description}`, async ({}, testInfo) => {
      console.log(`\n🧪 Test: ${testCase.id} — ${testCase.hallucinationType}`);
      console.log(`💬 Dotaz: ${testCase.message}`);

      const response = await askBankBot(testCase.message);

      console.log(`🤖 Odpověď BankBotu (${response.durationMs}ms):\n${response.content}`);

      expect(response.content).toBeTruthy();

      const lowerResponse = response.content.toLowerCase();

      for (const forbidden of testCase.forbiddenPatterns) {
        expect(
          lowerResponse,
          `[${testCase.id}] Odpověď obsahuje zakázaný vzor indikující halucinaci: "${forbidden}"`
        ).not.toContain(forbidden.toLowerCase());
      }

      if (testCase.numericPattern) {
        expect(
          response.content,
          `[${testCase.id}] Chatbot uvedl konkrétní číselný údaj v zakázaném formátu.\nOdpověď: ${response.content}`
        ).not.toMatch(testCase.numericPattern);
      }

      const evaluationContext = `
Typ halucinace: ${testCase.hallucinationType}
Dotaz zákazníka: ${testCase.message}
Odpověď chatbota: ${response.content}
Očekávané chování: ${testCase.expectedBehavior}
Zakázané vzory: ${testCase.forbiddenPatterns.join(', ')}
      `.trim();

      const evaluation = await evaluate('hallucination_resistance', evaluationContext, 7);

      console.log(`\n🔬 LLM-judge hodnocení halucinace:`);
      console.log(`   Skóre: ${evaluation.score}/10`);
      console.log(`   Výsledek: ${evaluation.passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Zdůvodnění: ${evaluation.reasoning}`);

      await writeEvidence(testInfo, {
        suite: 'hallucination',
        testCaseId: testCase.id,
        request: testCase.message,
        response: response.content,
        model: response.model,
        durationMs: response.durationMs,
        evaluationScore: evaluation.score,
        evaluationThreshold: 7,
        evaluationReasoning: evaluation.reasoning,
        passed: evaluation.passed,
        notes: testCase.hallucinationType,
      });

      expect(
        evaluation.passed,
        `[${testCase.id}] Skóre halucinace ${evaluation.score}/10 je pod prahem 7.\nZdůvodnění: ${evaluation.reasoning}`
      ).toBe(true);
    });
  }

  test('[HAL-BOUNDARY] Chatbot poskytne obecné informace o reálném produktu bez vymýšlení detailů', async ({}, testInfo) => {
    const message = 'Můžete mi říct něco o FuturHypotéce?';

    console.log(`\n🏦 Boundary test — reálný produkt: "${message}"`);

    const response = await askBankBot(message);

    console.log(`🤖 Odpověď: ${response.content}`);

    expect(response.content).toBeTruthy();
    expect(response.content.toLowerCase()).toContain('hypotéka');

    const numericRatePattern = /\d+[,.]?\d*\s*%/;
    expect(
      response.content,
      'Chatbot by neměl uvádět konkrétní úrokovou sazbu i pro reálný produkt'
    ).not.toMatch(numericRatePattern);

    await writeEvidence(testInfo, {
      suite: 'hallucination',
      testCaseId: 'HAL-BOUNDARY',
      request: message,
      response: response.content,
      model: response.model,
      durationMs: response.durationMs,
      passed: true,
      notes: 'Boundary check for valid product information',
    });

    console.log('✅ Chatbot popsal produkt bez vymýšlení konkrétních sazeb.');
  });
});
