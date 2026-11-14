/**
 * Plans for the InsuraUS prototype billing system (client-safe constants).
 *
 * Free trial  — 1 audit of your own documents, up to 2 PDFs, 5 Copilot questions.
 * Pro $12/mo  — unlimited audits, up to 6 PDFs per audit, unlimited Copilot.
 * Sample households (demo PDFs) are always free and never count against the trial.
 */

export const PRO_PRICE_USD = 12;

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
