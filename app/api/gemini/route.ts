import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isLocalDevMode } from "@/lib/auth-config";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function requireUserId(session: Session | null): string | null {
  if (isLocalDevMode) return "local-dev-user";
  const email = session?.user?.email;
  return email ?? null;
}

export async function POST(request: Request) {
  const session = (await auth()) as Session | null;
  const userId = requireUserId(session);
  if (!userId) return unauthorized();

  const apiKey = process.env.GEMINI_API_KEY?.trim();
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
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

    const prompt = `あなたは「人生のカレンダー」アプリの計画アシスタントです。
ユーザーの人生設計・予定・ワークシートを支援してください。
回答は日本語、簡潔で actionable に。箇条書きを適宜使ってください。

--- アプリ内データ（参考） ---
${context.slice(0, 12_000)}

--- ユーザーの質問 ---
${message}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error", geminiRes.status, errText);
      return NextResponse.json(
        { error: "Gemini API の呼び出しに失敗しました" },
        { status: 502 },
      );
    }

    const data = (await geminiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim() ?? "";

    if (!reply) {
      return NextResponse.json(
        { error: "AI から応答がありませんでした" },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("POST /api/gemini", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
