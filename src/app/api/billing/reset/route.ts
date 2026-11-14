import { NextResponse } from "next/server";
import { clearProCookie, clearTrialCookie, toStatus } from "@/lib/billing/server";
import type { BillingStatus } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/** POST /api/billing/reset — demo helper: back to a fresh free trial (for pitching / judging). */
export async function POST() {
  const res = NextResponse.json<BillingStatus>(toStatus({ pro: null, trial: { audits: 0, chats: 0 } }));
  res.headers.append("Set-Cookie", clearProCookie());
  res.headers.append("Set-Cookie", clearTrialCookie());
  return res;
}
