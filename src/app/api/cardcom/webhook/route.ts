import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CARDCOM_RESULT_URL =
  "https://secure.cardcom.solutions/api/v11/LowProfile/GetLpResult";
const TERMINAL = Number(process.env.CARDCOM_TERMINAL ?? 1000);
const API_NAME = process.env.CARDCOM_API_NAME ?? "CardTest1994";
const API_PASSWORD = process.env.CARDCOM_API_PASSWORD ?? "Terminaltest2026";

export async function POST(request: NextRequest) {
  let lowProfileId: string | undefined;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    lowProfileId = body.LowProfileId ?? body.lowProfileId;
  } else {
    const form = await request.formData();
    lowProfileId =
      (form.get("LowProfileId") as string) ??
      (form.get("lowProfileId") as string);
  }

  if (!lowProfileId) {
    return NextResponse.json({ error: "Missing LowProfileId" }, { status: 400 });
  }

  // Verify with Cardcom
  const verifyRes = await fetch(CARDCOM_RESULT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalNumber: TERMINAL,
      ApiName: API_NAME,
      ApiPassword: API_PASSWORD,
      LowProfileId: lowProfileId,
    }),
  });

  if (!verifyRes.ok) {
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  const result = await verifyRes.json();

  // ResponseCode 0 = success
  if (result.ResponseCode !== 0) {
    return NextResponse.json({ ok: false, code: result.ResponseCode });
  }

  const userId: string = result.ReturnValue;
  const amountShekels: number = result.Amount ?? 0;
  const amountAgorot = Math.round(amountShekels * 100);
  const transactionId: string = String(result.TranzactionId ?? "");

  if (!userId || amountAgorot <= 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotency — skip if already processed
  const { data: existing } = await supabase
    .from("wallet_transactions")
    .select("id")
    .eq("reference_id", transactionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Credit wallet
  const { error: rpcError } = await supabase.rpc("credit_wallet", {
    p_user_id: userId,
    p_amount: amountAgorot,
    p_reference_id: transactionId,
    p_description: `טעינת ארנק — ${amountShekels} ₪`,
  });

  if (rpcError) {
    console.error("credit_wallet RPC error:", rpcError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
