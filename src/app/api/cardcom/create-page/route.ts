import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CARDCOM_URL = "https://secure.cardcom.solutions/api/v11/LowProfile/Create";
const TERMINAL = Number(process.env.CARDCOM_TERMINAL ?? 1000);
const API_NAME = process.env.CARDCOM_API_NAME ?? "CardTest1994";
const API_PASSWORD = process.env.CARDCOM_API_PASSWORD ?? "Terminaltest2026";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.jaselp.com";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amountAgorot } = await request.json();

  if (!amountAgorot || amountAgorot < 100) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Cardcom expects shekels, not agorot
  const amountShekels = amountAgorot / 100;

  const body = {
    TerminalNumber: TERMINAL,
    ApiName: API_NAME,
    ApiPassword: API_PASSWORD,
    Amount: amountShekels,
    SuccessRedirectUrl: `${BASE_URL}/wallet/topup/success`,
    FailedRedirectUrl: `${BASE_URL}/wallet/topup/failed`,
    WebHookUrl: `${BASE_URL}/api/cardcom/webhook`,
    ReturnValue: user.id,
    Language: "he",
    Document: {
      To: user.email ?? "",
      Products: [
        {
          Description: "טעינת ארנק HelpLine",
          UnitCost: amountShekels,
          Quantity: 1,
        },
      ],
    },
  };

  const res = await fetch(CARDCOM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Cardcom error" }, { status: 502 });
  }

  const data = await res.json();

  if (data.ResponseCode !== 0) {
    return NextResponse.json(
      { error: data.Description ?? "Payment error" },
      { status: 400 }
    );
  }

  return NextResponse.json({ url: data.Url, lowProfileId: data.LowProfileId });
}
