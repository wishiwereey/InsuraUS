import { NextResponse } from "next/server";
import { readBilling, toStatus } from "@/lib/billing/server";
import type { BillingStatus } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/** GET /api/billing/status — current plan and remaining free-trial allowance. */
export async function GET(req: Request) {
  return NextResponse.json<BillingStatus>(toStatus(readBilling(req)), { headers: { "Cache-Control": "no-store" } });
}
