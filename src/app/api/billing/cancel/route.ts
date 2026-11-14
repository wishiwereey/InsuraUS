import { NextResponse } from "next/server";
import { clearProCookie, readBilling, toStatus } from "@/lib/billing/server";
import type { BillingStatus } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/** POST /api/billing/cancel — ends the prototype Pro subscription immediately. */
export async function POST(req: Request) {
  const state = readBilling(req);
  const res = NextResponse.json<BillingStatus>(toStatus({ ...state, pro: null }));
  res.headers.append("Set-Cookie", clearProCookie());
  return res;
}
