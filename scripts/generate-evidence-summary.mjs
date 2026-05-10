import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Prevents CSV formula injection when the file is opened in spreadsheet software.
const csvCell = (val) => {
  const s = String(val ?? '');
  if (/[,"\n\r]/.test(s) || /^[=+\-@\t]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Escapes pipe characters so they don't break the markdown table structure.
const mdCell = (val) => String(val ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

const evidenceRoot = path.resolve(process.cwd(), 'evidence');

const run = async () => {
  const runs = await readdir(evidenceRoot, { withFileTypes: true }).catch(() => []);
  const runDirs = runs.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  if (runDirs.length === 0) {
    console.log('No evidence runs found.');
    return;
  }

  const latest = runDirs[runDirs.length - 1];
  const jsonlPath = path.join(evidenceRoot, latest, 'evidence.jsonl');
  const summaryPath = path.join(evidenceRoot, latest, 'summary.md');
  const csvPath = path.join(evidenceRoot, latest, 'summary.csv');

  const raw = await readFile(jsonlPath, 'utf8');
  const entries = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const total = entries.length;
  const passed = entries.filter((entry) => entry.passed).length;
  const failed = total - passed;

  const lines = [
    '# Test Evidence Summary',
    '',
    `- Run ID: \`${latest}\``,
    `- Total entries: **${total}**`,
    `- Passed: **${passed}**`,
    `- Failed: **${failed}**`,
    '',
    '| Timestamp | Suite | Case | Score | Passed |',
    '|---|---|---|---:|---|',
  ];

  for (const entry of entries) {
    const score = typeof entry.evaluationScore === 'number' ? entry.evaluationScore : '-';
    lines.push(
      `| ${mdCell(entry.timestamp)} | ${mdCell(entry.suite)} | ${mdCell(entry.testCaseId)} | ${score} | ${entry.passed ? 'yes' : 'no'} |`
    );
  }

  await writeFile(summaryPath, `${lines.join('\n')}\n`, 'utf8');
  const csvHeader = [
    'timestamp',
    'suite',
    'testCaseId',
    'score',
    'threshold',
    'passed',
    'model',
    'durationMs',
    'notes',
  ].join(',');
  const csvLines = entries.map((entry) =>
    [
      csvCell(entry.timestamp),
      csvCell(entry.suite),
      csvCell(entry.testCaseId),
      typeof entry.evaluationScore === 'number' ? entry.evaluationScore : '',
      typeof entry.evaluationThreshold === 'number' ? entry.evaluationThreshold : '',
      entry.passed ? 'yes' : 'no',
      csvCell(entry.model ?? ''),
      entry.durationMs ?? '',
      csvCell(entry.notes ?? ''),
    ].join(',')
  );
  await writeFile(csvPath, `${[csvHeader, ...csvLines].join('\n')}\n`, 'utf8');
  console.log(`Evidence summary generated: ${summaryPath}`);
  console.log(`Evidence CSV generated: ${csvPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
