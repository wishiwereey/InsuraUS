# InsuraUS — AI Insurance Policy Auditor & Optimizer

> **Stop silently overpaying for insurance you don't understand.**

InsuraUS reads your real insurance PDFs (auto, health, home, renters) and returns an audit in under a minute:

- an **Insurance Health Score**
- hidden overpayments and duplicate coverage, each with a dollar estimate
- a **What-If claim stress test** comparing your current plan with the optimized plan
- a ready-to-send **negotiation script** for your carrier
- a **Policy Copilot** chat grounded in your own documents

There's no sign-up or login. The app opens straight into the product.

---

## The problem

US working adults aged 25–45 often pay **$400–$1,000/month** across auto, health and home insurance. Most never read past the
first page of the declarations. Common leaks include:

| Leak | Typical cost |
| --- | --- |
| $250 collision deductible on a 10-year-old car | $300–$600/yr |
| Roadside / ID-theft / rental add-ons bought twice | $50–$200/yr |
| Rich PPO or Platinum plan for a household that sees a doctor twice a year | $800–$2,000/yr |
| Missed bundle, alarm, low-mileage and defensive-driving discounts | $150–$500/yr |

Brokers are paid by commission, so they have little reason to point these out. InsuraUS acts as an independent, educational
fiduciary.

## Try it in 30 seconds

1. Open the app and scroll to **Live demo** (or go to **Start audit**).
2. Click **"The Miller Family (Austin, TX)"** or **"Alex Rivera (San Diego, CA)"**.
3. The app generates real multi-page declarations PDFs on the server, downloads them to the browser and uploads them through
   the **same** Gemini pipeline a user upload uses. Nothing is precomputed.
4. The **Sample policies** page previews all six PDFs; download them and drag them into the uploader yourself.

| Preset | Policies | Annual spend | Problems seeded into the documents |
| --- | --- | --- | --- |
| Miller Family, Austin TX | Auto (2 cars), Family PPO, HO-3 | **$8,640** | $250 deductibles on a $7.2k Civic, duplicate roadside and ID-theft cover, underused PPO next to a cheaper HSA option with a $1,200 employer seed, alarm and bundle discounts missing |
| Alex Rivera, San Diego CA | Auto (2012 Mazda3), Renters, Platinum PPO | **$3,420** | Full physical-damage cover on a ~$6.5k car, liability at CA minimum (30/60/15), low-mileage discount missing for a hybrid worker, Platinum plan with 1 visit/yr |

The documents only contain facts: premiums, limits, plan options and utilization. They never state the findings. Gemini has to
work them out on its own.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Landing: dark "X-ray" hero, the four common leaks, how it works, live demo households |
| `/audit` | Upload PDFs + optional household context; shows step-by-step progress while Gemini works |
| `/results` | Report overview: health score, spend, savings, 5-year wealth impact, savings by policy, top 3 wins |
| `/results/policies` | Expandable policy cards: Jargon Translator + red/amber/green findings, filterable by status |
| `/results/stress-test` | What-If simulator: 3 claim scenarios, claim year vs quiet year chart |
| `/results/negotiate` | Email + phone script, copy / open-in-mail, pre-call checklist |
| `/results/copilot` | Streaming chat grounded in the uploaded PDFs |
| `/samples` | Preview, download or audit the six generated sample PDFs |
| `/pricing` | Free trial vs Pro ($12/mo), comparison table, FAQ |
| `/checkout` | Test-mode checkout (test cards only, nothing is charged) |
| `/account` | Plan, renewal, invoice, cancel, reset demo billing |

The audit lives in a React context (`AuditProvider`) in the root layout, so it survives navigation between pages. The
report JSON is kept in `sessionStorage` and the PDFs in IndexedDB, so a page refresh doesn't lose it. Nothing leaves the
browser except the requests to the app's own API.

## Business model (prototype billing)

| Plan | Price | Includes |
| --- | --- | --- |
| Free trial | $0 | 1 audit of your own policies, up to 2 PDFs, 5 Copilot questions |
| Pro | $12 / month | Unlimited audits, up to 6 PDFs per audit, unlimited Copilot |

The sample households are always free and never count against the trial. The server recognizes them by SHA-256, because
sample generation is deterministic.

How it works without accounts or a database:
- Plan state is kept in two **HMAC-signed, httpOnly cookies**: `insuraus_pro` and `insuraus_trial`. The server enforces
  every limit in `/api/analyze` and `/api/chat` and returns `402 PAYWALL` when one is hit. Editing a cookie can't grant
  Pro, because the signature check fails.
- `/checkout` runs in **test mode only**. It accepts only the test cards `4242 4242 4242 4242` and
  `5555 5555 5555 4444`. The full card number never leaves the browser; the server receives only the last 4 digits and the
  brand.
- `/account` shows the plan, renewal date and invoice, and can cancel. "Reset demo billing" returns to a fresh trial,
  which helps when demoing the paywall.
- Going live would mean swapping `/api/billing/checkout` for a Stripe Checkout Session plus webhook, and moving plan state
  onto user accounts. Clearing cookies currently resets the trial, which is acceptable for a prototype.

Set `BILLING_SECRET` to a long random string in production. Without it, a secret is derived from `GEMINI_API_KEY`.

## Architecture

```
Browser                                          Server (Next.js route handlers, Node runtime)
───────                                          ─────────────────────────────────────────────
/audit  (File[] + UserContext) ── multipart ──▶ POST /api/analyze
                                                ├─ readPdfUploads(): magic-byte check, size limits, base64
                                                ├─ Gemini gemini-2.5-flash, inlineData PDFs + auditor system prompt
                                                │    1st: responseSchema (strict structured output)
                                                │    if Gemini rejects the schema (400) → JSON mode + schema in prompt
                                                │    if the model id is unavailable (404) → gemini-flash-latest
                                                └─ normalizeAudit(): clamp, sort, recompute every total
/results/* ◀──── AnalyzeResponse ───────────────┘
/results/copilot ── PDFs + history + audit ──▶ POST /api/chat → streamed text (generateContentStream)
DemoPresets / /samples ── GET /api/samples/:id ──▶ pdf-lib generator (src/lib/sample-pdfs.ts)
```

### Design decisions

- **The LLM reasons, deterministic code does the arithmetic.** Gemini extracts facts and makes judgments. `normalizeAudit()`
  then recomputes each policy's optimized premium (current minus the sum of its issue savings), the portfolio totals, the
  what-if net costs (premiums plus out-of-pocket) and each policy's status. The numbers on screen always add up.
- **Strict structured output.** `src/lib/gemini/schema.ts` is a full `responseSchema` with enums, required fields and
  `propertyOrdering` (extract → diagnose → quantify → summarize). It mirrors `src/types/insurance.ts`.
- **Stateless and private.** There are no accounts and no database. PDFs stay in memory for the length of the request. The chat
  re-sends the PDFs each turn, so the server never stores them.
- **Honest trade-offs.** The prompt requires at least one scenario where the cheaper plan costs *more* out-of-pocket. It also
  ties every deductible increase to the household's emergency fund.
- **Defensive input handling.** Uploads are checked by `%PDF-` magic bytes, with limits of 6 files, 10 MB per file and 18 MB
  total (Gemini's inline limit is 20 MB). Household context is whitelisted. Upstream errors are mapped to safe messages (rate
  limit, bad key, outage).

## Insurance logic in the auditor prompt

`src/lib/gemini/prompts.ts` holds a written-out playbook:

- **Auto:** drop or raise physical-damage coverage when ACV is under ~$8k or collision+comp is more than 10% of ACV, but only
  without a lienholder. Moving from $250 to $1,000 deductibles saves an estimated 15–25% on collision, but only if the
  emergency fund can cover the higher deductible. Flags duplicate towing/roadside and ID-theft cover, missing discounts (bundle,
  paperless, TX defensive driving, low mileage/telematics) and liability at state minimums (suggests 100/300/100 plus an
  umbrella).
- **Health:** compares every plan option in the document by expected annual cost (premiums + expected out-of-pocket from actual
  utilization − employer HSA seed − tax savings) and by worst-case cost (premiums + OOP max − HSA seed). Plan changes are timed
  to Open Enrollment or a Qualifying Life Event.
- **Home/Renters:** checks the 80% replacement-cost rule, TX/FL/coastal wind and hail percentage deductibles, flood exclusion,
  roof age, monitored-alarm credits, and $100k vs $300k renters liability.
- **State nuance:** TX 30/60/25, CA 30/60/15 (since 2025) and the Good Driver discount, FL PIP and hurricane deductibles, NY
  no-fault.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style primitives on Radix (Dialog, Tabs, Slot) ·
Lucide icons · Recharts · pdf-lib · `@google/genai` (`gemini-2.5-flash`).

## Local setup

Requires **Node 20+**.

```bash
git clone <your-repo-url> insuraus
```

```bash
cd insuraus
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Get a free API key at https://aistudio.google.com/apikey and set `GEMINI_API_KEY` in `.env.local`. Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run samples` | Writes all 6 demo PDFs to `./sample-pdfs/` |

### Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Google AI Studio key, used only on the server |
| `GEMINI_MODEL` | – | Overrides the model (default `gemini-2.5-flash`) |
| `BILLING_SECRET` | – | Signs the plan cookies. Set it in production |

### Deploying to Vercel

Import the repo, add `GEMINI_API_KEY` under Project → Settings → Environment Variables, and deploy. `/api/analyze` sets
`maxDuration = 120`. On the Hobby plan Vercel caps this at 60 s, which is usually enough for `gemini-2.5-flash`.

## Troubleshooting

| Error | Fix |
| --- | --- |
| `GEMINI_API_KEY is not configured` | Create `.env.local` with the key and restart `npm run dev` |
| `Your Gemini API key was rejected` | Re-copy the key from AI Studio; no quotes or spaces |
| `Gemini API isn't available from your current region` | Deploy to Vercel (US servers) or use a VPN for local testing |
| `Gemini request failed (400): …` | The message after the colon is Gemini's own explanation; the server log shows the full text |

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                  # Landing
│  ├─ audit/page.tsx            # Upload + progress
│  ├─ results/                  # layout.tsx (report header + tabs) and 5 tab pages
│  ├─ samples/                  # Sample PDF library
│  └─ api/{analyze,chat,samples/[id]}/route.ts
├─ components/
│  ├─ providers/AuditProvider.tsx  # App-wide audit state + persistence
│  ├─ site/                     # Header, logo
│  ├─ landing/                  # HeroXray, UploadZone, ContextBar, DemoPresets
│  ├─ results/ResultsShell.tsx  # Report header, tab nav, empty state
│  ├─ audit/                    # AnalysisProgress, KpiRow, HealthScoreCard, PolicyBreakdown,
│  │                            # WhatIfSimulator, NegotiationPanel, PolicyChat
│  └─ ui/                       # button, card, badge, tabs
├─ lib/
│  ├─ gemini/                   # client.ts (errors, fallbacks), schema.ts, prompts.ts
│  ├─ audit/normalize.ts        # Deterministic post-processing of model output
│  ├─ pdf/dec-page-builder.ts   # Small pdf-lib layout engine
│  ├─ sample-pdfs.ts            # The 6 fictional US policy documents
│  └─ storage.ts · presets.ts · finance.ts · request.ts · utils.ts
└─ types/insurance.ts           # Domain types (mirror of the Gemini schema)
```

## Disclaimer

InsuraUS is an educational tool. It is not a licensed insurance agent or broker and receives no commissions. Savings are
estimates; confirm changes with your carrier in writing. All sample carriers, people, VINs and policy numbers are fictional.
