import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { proCookie, readBilling, toStatus } from "@/lib/billing/server";
import { PRICES, isBillingInterval, type BillingStatus, type ProSubscription } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout — PROTOTYPE payment. No payment processor is
 * called and no card data is sent here: the client validates a test card
 * locally and posts only its last 4 digits, brand and the chosen billing
 * interval. The price is decided here on the server, never by the client.
 * A production version would create a Stripe Checkout Session and grant Pro
 * from the webhook.
 */
export async function POST(req: Request) {
  let body: { last4?: unknown; brand?: unknown; interval?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const last4 = typeof body.last4 === "string" && /^\d{4}$/.test(body.last4) ? body.last4 : null;
  const brand = body.brand === "Mastercard" ? "Mastercard" : body.brand === "Visa" ? "Visa" : null;
  if (!last4 || !brand) return NextResponse.json({ error: "Invalid test card." }, { status: 400 });

  // Default to monthly for older clients; reject anything else.
  const interval = body.interval === undefined ? "month" : body.interval;
  if (!isBillingInterval(interval)) return NextResponse.json({ error: "Invalid billing interval." }, { status: 400 });

  const now = new Date();
  const renews = new Date(now);
  if (interval === "year") renews.setFullYear(renews.getFullYear() + 1);
  else renews.setMonth(renews.getMonth() + 1);

  const sub: ProSubscription = {
    since: now.toISOString(),
    renewsAt: renews.toISOString(),
    last4,
    brand,
    invoiceId: `INV-${now.getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`,
    interval,
    amount: PRICES[interval].amount,
  };

  const state = readBilling(req);
  const res = NextResponse.json<BillingStatus>(toStatus({ ...state, pro: sub }));
  res.headers.append("Set-Cookie", proCookie(sub));
  return res;
}
