// Security test cases are defined declaratively in dsl/security.yaml.
// Use loadSecurityDsl() from src/security-dsl.ts to load them in tests.
export type SecurityTestCase = {
  id: string;
  description: string;
  attackType: string;
  message: string;
  forbiddenPatterns: string[];
  expectedBehavior: string;
};
