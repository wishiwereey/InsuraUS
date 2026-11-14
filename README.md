# CoverLens — AI Insurance Policy Auditor & Optimizer

> **Stop silently overpaying for insurance you don't understand.**

CoverLens reads your real insurance PDFs (auto, health, home, renters) and returns an audit in under a minute:

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

Brokers are paid by commission, so they have little reason to point these out. CoverLens acts as an independent, educational
fiduciary.

## Try it in 30 seconds

1. Open the app.
2. Click **"The Miller Family (Austin, TX)"** or **"Alex Rivera (San Diego, CA)"**.
3. The app generates real multi-page declarations PDFs on the server, downloads them to the browser and uploads them through
   the **same** Gemini pipeline a user upload uses. Nothing is precomputed.
4. You can also click **Download sample PDFs**, open the files, and drag them into the uploader yourself.

| Preset | Policies | Annual spend | Problems seeded into the documents |
| --- | --- | --- | --- |
| Miller Family, Austin TX | Auto (2 cars), Family PPO, HO-3 | **$8,640** | $250 deductibles on a $7.2k Civic, duplicate roadside and ID-theft cover, underused PPO next to a cheaper HSA option with a $1,200 employer seed, alarm and bundle discounts missing |
| Alex Rivera, San Diego CA | Auto (2012 Mazda3), Renters, Platinum PPO | **$3,420** | Full physical-damage cover on a ~$6.5k car, liability at CA minimum (30/60/15), low-mileage discount missing for a hybrid worker, Platinum plan with 1 visit/yr |

The documents only contain facts: premiums, limits, plan options and utilization. They never state the findings. Gemini has to
work them out on its own.

## Architecture

```
Browser (Next.js client)                        Server (Next.js route handlers, Node runtime)
────────────────────────                        ─────────────────────────────────────────────
UploadZone / DemoPresets ── multipart ──▶ POST /api/analyze
  (File[] + UserContext)                       ├─ readPdfUploads(): magic-byte check, size limits, base64
                                               ├─ Gemini gemini-2.5-flash
                                               │    inlineData PDFs + system prompt (auditor playbook)
                                               │    responseMimeType: application/json + responseSchema
                                               └─ normalizeAudit(): clamp, sort, recompute every total
ResultsDashboard ◀──── AnalyzeResponse ────────┘
  ├─ KpiRow (score gauge, spend, savings, 5-yr FV @ 7%)
  ├─ PolicyBreakdown (Jargon Translator + red/amber/green flags)
  ├─ WhatIfSimulator (Recharts stacked bars, claim year vs quiet year)
  ├─ NegotiationDrawer (email / phone tabs, copy, mailto)
  └─ PolicyChat ── multipart (PDFs + history + audit) ──▶ POST /api/chat → streamed text (generateContentStream)

DemoPresets ── GET /api/samples/:id ──▶ pdf-lib generator (src/lib/sample-pdfs.ts)
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
git clone <your-repo-url> coverlens
```

```bash
cd coverlens
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

### Deploying to Vercel

Import the repo, add `GEMINI_API_KEY` under Project → Settings → Environment Variables, and deploy. `/api/analyze` sets
`maxDuration = 120`. On the Hobby plan Vercel caps this at 60 s, which is usually enough for `gemini-2.5-flash`.

## Project structure

```
src/
├─ app/
│  ├─ api/analyze/route.ts      # PDF(s) + context → Gemini structured audit
│  ├─ api/chat/route.ts         # Streaming Policy Copilot grounded in the PDFs
│  ├─ api/samples/[id]/route.ts # On-the-fly sample declarations PDFs
│  ├─ layout.tsx · page.tsx · globals.css
├─ components/
│  ├─ CoverLensApp.tsx          # Phase state machine: input → analyzing → results
│  ├─ landing/                  # UploadZone, ContextBar, DemoPresets
│  ├─ audit/                    # AnalysisProgress, KpiRow, HealthScoreCard, PolicyBreakdown,
│  │                            # WhatIfSimulator, NegotiationDrawer, PolicyChat, ResultsDashboard
│  └─ ui/                       # button, card, badge, tabs, sheet
├─ lib/
│  ├─ gemini/                   # client.ts, schema.ts (responseSchema), prompts.ts
│  ├─ audit/normalize.ts        # Deterministic post-processing of model output
│  ├─ pdf/dec-page-builder.ts   # Small pdf-lib layout engine (tables, headers, page numbers)
│  ├─ sample-pdfs.ts            # The 6 fictional US policy documents
│  ├─ samples-meta.ts · presets.ts · finance.ts · request.ts · utils.ts
└─ types/insurance.ts           # Domain types (mirror of the Gemini schema)
```

## Disclaimer

CoverLens is an educational tool. It is not a licensed insurance agent or broker and receives no commissions. Savings are
estimates; confirm changes with your carrier in writing. All sample carriers, people, VINs and policy numbers are fictional.
