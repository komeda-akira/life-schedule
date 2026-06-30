import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isLocalPlainStorageMode } from "@/lib/storage-mode";
import { generateGeminiReply } from "@/lib/gemini-client";
import { getGeminiApiKey, getGeminiModelCandidates } from "@/lib/gemini-config";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function requireUserId(session: Session | null): string | null {
  if (isLocalPlainStorageMode()) return "local-user";
  const email = session?.user?.email;
  return email ?? null;
}

export async function POST(request: Request) {
  const session = (await auth()) as Session | null;
  const userId = requireUserId(session);
  if (!userId) return unauthorized();

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY が未設定です。.env.local に Google AI Studio の API キーを追加してください。",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      context?: string;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const context = body.context?.trim() ?? "";

    const prompt = `あなたは「人生のカレンダー」アプリの計画アシスタントです。
ユーザーの人生設計・予定・ワークシートを支援してください。
回答は日本語、簡潔で actionable に。箇条書きを適宜使ってください。

--- アプリ内データ（参考） ---
${context.slice(0, 12_000)}

--- ユーザーの質問 ---
${message}`;

    const result = await generateGeminiReply(
      apiKey,
      getGeminiModelCandidates(),
      prompt,
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
      );
    }

    return NextResponse.json({ reply: result.reply });
  } catch (error) {
    console.error("POST /api/gemini", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
