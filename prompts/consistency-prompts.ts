export type ConsistencyTestCase = {
  id: string;
  description: string;
  consistencyType: string;
  messages: string[];
  expectedBehavior: string;
};

export type LanguageTestCase = {
  id: string;
  description: string;
  message: string;
  inputLanguage: string;
  expectedOutputLanguage: 'cs';
  expectedBehavior: string;
};

/**
 * Consistency test prompts.
 * The same question is asked multiple times — responses must be semantically consistent.
 * Evaluation: LLM-as-judge compares all responses for coherence.
 */
export const CONSISTENCY_TEST_CASES: ConsistencyTestCase[] = [
  {
    id: 'CON-001',
    description: 'Stejný dotaz na otevření účtu — 3x opakování',
    consistencyType: 'Repeated question consistency',
    messages: [
      'Jak si mohu otevřít běžný účet u FuturBank CZ?',
      'Jak si mohu otevřít běžný účet u FuturBank CZ?',
      'Jak si mohu otevřít běžný účet u FuturBank CZ?',
    ],
    expectedBehavior:
      'Všechny 3 odpovědi musí poskytovat konzistentní informace (stejný produkt, stejné kroky, žádné rozpory).',
  },
  {
    id: 'CON-002',
    description: 'Přeformulovaný dotaz na stejné téma — konzistence napříč formulacemi',
    consistencyType: 'Paraphrased question consistency',
    messages: [
      'Jaké dokumenty potřebuji k otevření účtu?',
      'Co musím přinést na pobočku, když chci založit nový účet?',
      'Jaké jsou požadavky pro zřízení bankovního účtu u vás?',
    ],
    // Note: paraphrased questions inherently produce slightly different answers —
    // we evaluate for semantic coherence, not word-for-word matching.
    // Passing threshold is lower (5) to account for natural language variation.
    expectedBehavior:
      'Odpovědi musí být sémanticky konzistentní — žádné přímé rozpory v základních požadavcích.',
  },
];

/**
 * Language compliance test prompts.
 * The chatbot must always respond in Czech, regardless of the input language.
 */
export const LANGUAGE_TEST_CASES: LanguageTestCase[] = [
  {
    id: 'LANG-001',
    description: 'Dotaz v angličtině — odpověď musí být česky',
    message: 'Hello, I would like to open a savings account. What are my options?',
    inputLanguage: 'English',
    expectedOutputLanguage: 'cs',
    expectedBehavior: 'Chatbot odpoví česky i přesto, že dotaz byl v angličtině.',
  },
  {
    id: 'LANG-002',
    description: 'Dotaz ve slovenštině — odpověď musí být česky',
    message: 'Dobrý deň, chcel by som informácie o hypotéke. Aké sú podmienky?',
    inputLanguage: 'Slovak',
    expectedOutputLanguage: 'cs',
    expectedBehavior: 'Chatbot odpoví česky i přesto, že dotaz byl ve slovenštině.',
  },
  {
    id: 'LANG-003',
    description: 'Dotaz v němčině — odpověď musí být česky',
    message: 'Guten Tag, ich möchte ein Konto eröffnen. Was brauche ich dafür?',
    inputLanguage: 'German',
    expectedOutputLanguage: 'cs',
    expectedBehavior: 'Chatbot odpoví česky i přesto, že dotaz byl v němčině.',
  },
];
