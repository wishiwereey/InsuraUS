/**
 * Plans for the InsuraUS prototype billing system (client-safe constants).
 *
 * Free trial  — 1 audit of your own documents, up to 2 PDFs, 5 Copilot questions.
 * Pro $12/mo or $89.99/yr — unlimited audits, up to 6 PDFs per audit, unlimited Copilot.
 * Sample households (demo PDFs) are always free and never count against the trial.
 */

export const PRO_PRICE_USD = 12;
export const PRO_ANNUAL_PRICE_USD = 89.99;

export type BillingInterval = "month" | "year";

export interface PriceOption {
  interval: BillingInterval;
  /** Charged once per billing period, USD. */
  amount: number;
  /** Effective monthly price, for comparison. */
  perMonth: number;
  label: string;
}

export const PRICES: Record<BillingInterval, PriceOption> = {
  month: { interval: "month", amount: PRO_PRICE_USD, perMonth: PRO_PRICE_USD, label: "Monthly" },
  year: { interval: "year", amount: PRO_ANNUAL_PRICE_USD, perMonth: PRO_ANNUAL_PRICE_USD / 12, label: "Yearly" },
};

/** Yearly vs. twelve monthly payments: $144 → $89.99, i.e. 37% off. */
export const ANNUAL_SAVINGS_PCT = Math.floor((1 - PRO_ANNUAL_PRICE_USD / (PRO_PRICE_USD * 12)) * 100);
export const ANNUAL_SAVINGS_USD = PRO_PRICE_USD * 12 - PRO_ANNUAL_PRICE_USD;

/** 12 → "$12", 89.99 → "$89.99", 7.499 → "$7.50". */
export const formatPrice = (n: number) => {
  const fixed = n.toFixed(2);
  return `$${fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed}`;
};

export const isBillingInterval = (v: unknown): v is BillingInterval => v === "month" || v === "year";

export const FREE_TRIAL = {
  audits: 1,
  maxFiles: 2,
  chatQuestions: 5,
} as const;

export const PRO_LIMITS = {
  maxFiles: 6,
} as const;

/** Demo checkout only accepts Stripe-style test card numbers — never real cards. */
export const TEST_CARD_NUMBERS = ["4242424242424242", "5555555555554444"];

export interface ProSubscription {
  since: string; // ISO date
  renewsAt: string; // ISO date
  last4: string;
  brand: "Visa" | "Mastercard";
  invoiceId: string;
  /** Absent on subscriptions created before yearly billing existed → treat as monthly. */
  interval?: BillingInterval;
  /** Amount charged for the current period, USD. */
  amount?: number;
}

export interface BillingStatus {
  plan: "free" | "pro";
  trialAuditsLeft: number;
  trialChatsLeft: number;
  pro: ProSubscription | null;
}

export type PaywallReason = "trial_used" | "file_limit" | "chat_limit";

export const PAYWALL_COPY: Record<PaywallReason, string> = {
  trial_used: "You've used your free audit. Upgrade to Pro to audit more policies.",
  file_limit: `The free trial audits up to ${FREE_TRIAL.maxFiles} of your own PDFs at once. Upgrade to Pro for up to ${PRO_LIMITS.maxFiles}.`,
  chat_limit: `You've used your ${FREE_TRIAL.chatQuestions} free Copilot questions. Upgrade to Pro for unlimited questions.`,
};
