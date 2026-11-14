import { FREE_TRIAL, PRO_LIMITS, PRO_PRICE_USD } from "@/lib/billing/plans";

/**
 * Single source of truth for InsuraUS's own policies (plans, cancellation,
 * refunds, data). Rendered on /terms and given to the Policy Copilot so it can
 * answer questions about the app, not just about insurance documents.
 */

export const TERMS_UPDATED = "November 14, 2026";

export interface TermsSection {
  id: string;
  title: string;
  points: string[];
}

export const TERMS: TermsSection[] = [
  {
    id: "service",
    title: "What InsuraUS is",
    points: [
      "InsuraUS is an educational tool that reads your insurance documents and estimates where you may be overpaying.",
      "We are not an insurance company, agent or broker. We don't sell insurance and we never take commissions or referral fees from insurers.",
      "Savings and claim scenarios are estimates. Confirm any change with your carrier in writing before you drop or reduce coverage.",
    ],
  },
  {
    id: "plans",
    title: "Plans",
    points: [
      `Free trial: ${FREE_TRIAL.audits} audit of your own policies (up to ${FREE_TRIAL.maxFiles} PDFs) and ${FREE_TRIAL.chatQuestions} Copilot questions.`,
      `Pro: $${PRO_PRICE_USD} per month — unlimited audits, up to ${PRO_LIMITS.maxFiles} PDFs per audit, unlimited Copilot questions.`,
      "Sample household demos are always free and never use up your trial.",
    ],
  },
  {
    id: "billing",
    title: "Billing & renewal",
    points: [
      `Pro is billed $${PRO_PRICE_USD} every month on the day you subscribed and renews automatically until you cancel.`,
      "Your renewal date and payment method are shown on the Account page.",
    ],
  },
  {
    id: "cancel",
    title: "How to cancel",
    points: [
      "Go to Account (top-right badge or the footer link) and click “Cancel subscription”. No phone call or email needed.",
      "You won't be charged again after you cancel. Pro features stop immediately in this prototype; in a production release they would last until the end of the paid month.",
      "Your past reports stay in your browser after cancelling.",
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    points: [
      "You can cancel anytime. Partial months are not refunded.",
      "If you were charged by mistake (for example, a double charge), contact us and we'll refund it.",
    ],
  },
  {
    id: "data",
    title: "Your documents & privacy",
    points: [
      "Uploaded PDFs are sent to Google's Gemini API to generate your audit and Copilot answers, processed in memory, and not stored on our servers.",
      "Your report and PDFs are kept only in your own browser (session storage and IndexedDB) so a refresh doesn't lose them. Starting a new audit clears them.",
      "We don't sell or share your data, and we don't need an account or your email.",
    ],
  },
  {
    id: "prototype",
    title: "Prototype notice",
    points: [
      "This is a hackathon prototype. Checkout runs in test mode: only test card numbers are accepted and no real payment is ever processed.",
      "Plan status is stored in signed browser cookies, so clearing cookies resets it.",
    ],
  },
];

/** Plain-text version for the Copilot system prompt. */
export function termsForPrompt(): string {
  return TERMS.map((s) => `${s.title}:\n${s.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n");
}
