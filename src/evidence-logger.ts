import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export type EvidenceEntry = {
  timestamp: string;
  suite: string;
  testTitle: string;
  testCaseId: string;
  request: string;
  response: string;
  model: string;
  durationMs: number;
  evaluationScore?: number;
  evaluationThreshold?: number;
  evaluationReasoning?: string;
  passed: boolean;
  notes?: string;
};

const runId = process.env.EVIDENCE_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
const evidenceDir = path.resolve(process.cwd(), 'evidence', runId);
const jsonlPath = path.join(evidenceDir, 'evidence.jsonl');

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const writeEvidence = async (
  testInfo: TestInfo,
  entry: Omit<EvidenceEntry, 'timestamp' | 'testTitle'>
): Promise<void> => {
  await mkdir(evidenceDir, { recursive: true });

  const payload: EvidenceEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    testTitle: testInfo.title,
    request: normalize(entry.request),
    response: normalize(entry.response),
  };

  await appendFile(jsonlPath, `${JSON.stringify(payload)}\n`, 'utf8');

  await testInfo.attach(`evidence-${entry.testCaseId}`, {
    body: JSON.stringify(payload, null, 2),
    contentType: 'application/json',
  });
};

export const getEvidenceLocation = (): string => evidenceDir;
