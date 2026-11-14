# Test results

Generated 2026-11-14 12:16 UTC with `npm run test:report` (Vitest, Node v22.23.4).

**68 / 68 tests passed** across 24 suites.

No Gemini API key is needed: the SDK is replaced by a fake client in `tests/gemini.test.ts`, and the other route tests stop at the billing/validation gate before any AI call.

## Coverage (`src/lib`, `src/app/api`)

| | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Total** | 94.5% | 82.1% | 96.4% | 95.3% |
| `app/api/analyze/route.ts` | 90.9% | 82.3% | 87.5% | 93.3% |
| `app/api/billing/cancel/route.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `app/api/billing/checkout/route.ts` | 93.8% | 91.7% | 100.0% | 93.3% |
| `app/api/billing/reset/route.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `app/api/billing/status/route.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `app/api/chat/route.ts` | 73.1% | 54.5% | 91.7% | 76.7% |
| `app/api/samples/[id]/route.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/finance.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/presets.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/product-info.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/request-limits.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/request.ts` | 97.4% | 97.1% | 100.0% | 100.0% |
| `lib/sample-pdfs.ts` | 100.0% | 71.4% | 100.0% | 100.0% |
| `lib/samples-meta.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/utils.ts` | 83.3% | 60.0% | 66.7% | 77.8% |
| `lib/audit/normalize.ts` | 100.0% | 77.5% | 100.0% | 100.0% |
| `lib/billing/plans.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/billing/samples.ts` | 100.0% | 100.0% | 100.0% | 100.0% |
| `lib/billing/server.ts` | 91.3% | 85.7% | 100.0% | 91.7% |
| `lib/gemini/client.ts` | 90.2% | 82.8% | 100.0% | 90.9% |
| `lib/pdf/dec-page-builder.ts` | 98.3% | 95.3% | 97.3% | 98.1% |

## What is tested

### `tests/api.test.ts` — 14/14 passed

- ✅ POST /api/analyze — free trial gate › lets a free user audit up to 2 of their own PDFs
- ✅ POST /api/analyze — free trial gate › returns 402 file_limit for 3 own PDFs on the free trial
- ✅ POST /api/analyze — free trial gate › returns 402 trial_used once the free audit is spent
- ✅ POST /api/analyze — free trial gate › keeps sample households free — even 3 files with a used-up trial
- ✅ POST /api/analyze — free trial gate › lets Pro users audit 3+ own PDFs after the trial is used
- ✅ POST /api/analyze — free trial gate › rejects a fake PDF with 400 before touching billing or Gemini
- ✅ POST /api/chat — Copilot question limit › returns 402 chat_limit after the free questions on own documents
- ✅ POST /api/chat — Copilot question limit › never meters questions about sample documents
- ✅ POST /api/chat — Copilot question limit › requires the last message to be from the user
- ✅ billing endpoints › checkout → status → cancel lifecycle
- ✅ billing endpoints › rejects checkout without valid test-card details
- ✅ billing endpoints › reset restores a fresh trial
- ✅ GET /api/samples/:id › serves a generated PDF inline or as a download
- ✅ GET /api/samples/:id › 404s for unknown ids

### `tests/billing.test.ts` — 9/9 passed

- ✅ signed billing cookies › round-trips trial usage
- ✅ signed billing cookies › round-trips a Pro subscription
- ✅ signed billing cookies › rejects a tampered payload (client can't grant itself Pro)
- ✅ signed billing cookies › rejects a cookie signed with a different secret
- ✅ signed billing cookies › ignores garbage and missing cookies
- ✅ signed billing cookies › treats an expired subscription as free
- ✅ signed billing cookies › sets httpOnly, SameSite=Lax cookies and clears with Max-Age=0
- ✅ toStatus › reports remaining trial allowance and never goes negative
- ✅ toStatus › reports Pro when subscribed

### `tests/gemini.test.ts` — 10/10 passed

- ✅ POST /api/analyze with Gemini › returns a normalized audit and consumes the free trial for own documents
- ✅ POST /api/analyze with Gemini › does not consume the trial for sample documents
- ✅ POST /api/analyze with Gemini › retries in JSON mode when Gemini rejects the response schema (400)
- ✅ POST /api/analyze with Gemini › falls back to another model when the configured one is unavailable (404)
- ✅ POST /api/analyze with Gemini › surfaces Gemini's own reason for other errors and does not consume the trial
- ✅ POST /api/analyze with Gemini › returns 502 for malformed JSON and 422 when no policy is found
- ✅ POST /api/chat with Gemini › streams the answer and meters questions on own documents
- ✅ Gemini error helpers › extracts the human-readable message from Google's JSON error body
- ✅ Gemini error helpers › classifies only request-shape 400s as retryable
- ✅ Gemini error helpers › maps errors to safe, actionable messages

### `tests/lib.test.ts` — 13/13 passed

- ✅ finance — 5-year wealth impact › matches the ordinary-annuity future value at 7%
- ✅ finance — 5-year wealth impact › is zero for no or negative savings
- ✅ finance — 5-year wealth impact › produces a monotonically growing series ending at the FV
- ✅ formatting helpers › formats whole dollars
- ✅ formatting helpers › trims the trailing amount from scenario titles
- ✅ sample PDF generator › miller-auto is a valid multi-section PDF
- ✅ sample PDF generator › miller-health is a valid multi-section PDF
- ✅ sample PDF generator › miller-home is a valid multi-section PDF
- ✅ sample PDF generator › rivera-auto is a valid multi-section PDF
- ✅ sample PDF generator › rivera-renters is a valid multi-section PDF
- ✅ sample PDF generator › rivera-health is a valid multi-section PDF
- ✅ sample PDF generator › is deterministic, so demo documents can be recognized by hash
- ✅ sample PDF generator › presets add up to the advertised household spend

### `tests/normalize.test.ts` — 14/14 passed

- ✅ normalizeAudit — totals are recomputed, never trusted from the model › sums current premiums and gross savings across policies
- ✅ normalizeAudit — totals are recomputed, never trusted from the model › reports protection upgrades separately instead of netting them out of savings (regression)
- ✅ normalizeAudit — totals are recomputed, never trusted from the model › parses money strings and rounds to whole dollars
- ✅ normalizeAudit — totals are recomputed, never trusted from the model › never produces a negative optimized premium
- ✅ normalizeAudit — policy status is derived deterministically › is 'overpaying' when savings are at least 10% of the premium
- ✅ normalizeAudit — policy status is derived deterministically › is 'suboptimal' for small savings or any coverage gap
- ✅ normalizeAudit — policy status is derived deterministically › is 'optimized' with no issues, and never 'overpaying' without evidence
- ✅ normalizeAudit — policy status is derived deterministically › sorts issues by severity, then by savings
- ✅ normalizeAudit — what-if scenarios › uses portfolio premiums from the policies and computes 1-year net cost
- ✅ normalizeAudit — what-if scenarios › caps out-of-pocket at the event cost and floors it at zero
- ✅ normalizeAudit — what-if scenarios › keeps at most 3 scenarios
- ✅ normalizeAudit — score and verdict › clamps the health score to 0–100
- ✅ normalizeAudit — score and verdict › falls back to the average of factor scores when the model omits the score
- ✅ normalizeAudit — score and verdict › keeps the verdict to one sentence and strips cents

### `tests/request.test.ts` — 8/8 passed

- ✅ parseUserContext — whitelists household context › keeps valid fields
- ✅ parseUserContext — whitelists household context › drops unknown states, out-of-range numbers and unexpected keys
- ✅ parseUserContext — whitelists household context › survives malformed or missing input
- ✅ readPdfUploads — validates uploads › accepts real PDFs and returns base64 + sha256
- ✅ readPdfUploads — validates uploads › rejects a non-PDF even with a .pdf name and PDF MIME type (magic-byte check)
- ✅ readPdfUploads — validates uploads › requires at least one file
- ✅ readPdfUploads — validates uploads › rejects more than 6 files
- ✅ readPdfUploads — validates uploads › rejects files over 10 MB with FILE_TOO_LARGE

## Reproduce

```bash
npm test              # run once
npm run test:report   # tests + coverage + this file + JUnit XML
```
