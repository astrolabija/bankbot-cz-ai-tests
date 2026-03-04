import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export type SecurityDslCase = {
  id: string;
  description: string;
  attackType: string;
  message: string;
  forbiddenPatterns: string[];
  expectedBehavior: string;
};

type SecurityDslDocument = {
  version: string;
  suite: string;
  description: string;
  threshold: number;
  cases: SecurityDslCase[];
};

const assertCase = (input: unknown, index: number): SecurityDslCase => {
  if (!input || typeof input !== 'object') {
    throw new Error(`Invalid DSL case at index ${index}`);
  }

  const obj = input as Partial<SecurityDslCase>;
  const required: Array<keyof SecurityDslCase> = [
    'id',
    'description',
    'attackType',
    'message',
    'forbiddenPatterns',
    'expectedBehavior',
  ];

  for (const key of required) {
    if (obj[key] === undefined) {
      throw new Error(`Missing required key "${key}" in DSL case at index ${index}`);
    }
  }

  if (!Array.isArray(obj.forbiddenPatterns)) {
    throw new Error(`forbiddenPatterns must be array in DSL case at index ${index}`);
  }

  return {
    id: String(obj.id),
    description: String(obj.description),
    attackType: String(obj.attackType),
    message: String(obj.message),
    forbiddenPatterns: obj.forbiddenPatterns.map((pattern) => String(pattern)),
    expectedBehavior: String(obj.expectedBehavior),
  };
};

export const loadSecurityDsl = (
  filePath = path.resolve(process.cwd(), 'dsl/security.yaml')
): { threshold: number; cases: SecurityDslCase[] } => {
  const raw = readFileSync(filePath, 'utf8');
  const parsed = parse(raw) as Partial<SecurityDslDocument>;

  if (!parsed || parsed.suite !== 'security') {
    throw new Error('Invalid security DSL document: expected suite=security');
  }
  if (!Array.isArray(parsed.cases)) {
    throw new Error('Invalid security DSL document: missing cases array');
  }

  const threshold = typeof parsed.threshold === 'number' ? parsed.threshold : 7;
  const cases = parsed.cases.map((testCase, index) => assertCase(testCase, index));

  return { threshold, cases };
};
