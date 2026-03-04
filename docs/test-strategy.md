# Test Strategy - BankBot CZ

## Purpose

This strategy defines how the BankBot CZ AI test suite validates safety, quality, and release readiness across mock and live execution modes.

## Scope

The automated suite covers 4 risk-focused quality domains:

- Bias and fairness
- Prompt injection and jailbreak resistance
- Hallucination prevention
- Response consistency and Czech-language compliance

## Test Levels

### 1) API behavior tests (primary level)

Playwright executes end-to-end API-oriented tests against the chatbot and the evaluator.

- Location: `tests/*.spec.ts`
- Trigger: local run and GitHub Actions
- Output: Playwright report + evidence artifacts

### 2) Prompt scenario tests

Structured prompt datasets provide deterministic coverage of expected attack vectors and quality behaviors.

- Location: `prompts/*.ts`
- Goal: keep scenarios reviewable and version-controlled

### 3) Evidence and traceability

Each test writes evidence records for auditability and stakeholder reporting.

- JSONL raw evidence: `evidence/<run-id>/evidence.jsonl`
- Markdown summary: `evidence/<run-id>/summary.md`
- CSV summary for dashboards: `evidence/<run-id>/summary.csv`

## Environments and Execution Modes

### Mock mode (`USE_MOCK=true`)

- Fast and deterministic
- No OpenAI token cost
- Suitable for CI smoke and regression checks

### Live mode (`USE_MOCK=false`)

- Calls OpenAI API for chatbot and judge
- Validates real model behavior
- Suitable for pre-release validation and evidence collection

## Entry and Exit Criteria

### Entry criteria

- Environment configured (`.env` locally or GitHub Secrets in CI)
- Dependencies installed
- Type check passes (`npm run typecheck`)

### Exit criteria

- No failing tests in targeted run
- Evidence files generated
- No secret leakage in logs or artifacts

## Release Recommendation Rules

- GO: all critical security/hallucination tests pass and no leakage indicators
- GO with conditions: non-critical consistency variance or low-score warnings requiring follow-up
- NO-GO: prompt leakage, critical security failure, or fabricated financial data in blocked scenarios

## Risks and Controls

- LLM variance: controlled with thresholded scoring and deterministic assertions
- API instability/rate limits: controlled with retry and backoff logic in client wrappers
- Secret handling risk: controlled by `.env` ignore rules and GitHub Secrets

## Maintenance Cadence

- Update prompt datasets when new risk patterns emerge
- Review thresholds monthly
- Re-run live validation before high-visibility demos or release announcements
