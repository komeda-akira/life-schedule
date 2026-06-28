type GeminiGenerateResult =
  | { ok: true; reply: string; model: string }
  | { ok: false; status: number; message: string };

function extractReply(data: {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

export function formatGeminiApiError(status: number, errText: string): string {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { message?: string; code?: number };
    };
    const msg = parsed.error?.message ?? errText;
    if (status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(msg)) {
      return "Gemini API の利用上限に達しました。数分待って再試行するか、Google AI Studio で利用可能なモデルを確認してください。";
    }
    if (status === 401 || status === 403 || /API key|permission/i.test(msg)) {
      return "Gemini API キーが無効です。Google AI Studio でキーを再発行してください。";
    }
    if (status === 404 || /not found|not supported/i.test(msg)) {
      return "指定した Gemini モデルが利用できません。GEMINI_MODEL を gemini-2.5-flash などに変更してください。";
    }
    return `Gemini API エラー: ${msg.slice(0, 200)}`;
  } catch {
    return "Gemini API の呼び出しに失敗しました";
  }
}

export async function generateGeminiReply(
  apiKey: string,
  models: string[],
  prompt: string,
): Promise<GeminiGenerateResult> {
  let lastStatus = 502;
  let lastMessage = "Gemini API の呼び出しに失敗しました";

  for (const model of models) {
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
      console.error("Gemini API error", model, geminiRes.status, errText);
      lastStatus = geminiRes.status;
      lastMessage = formatGeminiApiError(geminiRes.status, errText);
      if (geminiRes.status === 429 || geminiRes.status === 404) continue;
      return { ok: false, status: geminiRes.status, message: lastMessage };
    }

    const data = (await geminiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const reply = extractReply(data);
    if (!reply) {
      lastMessage = "AI から応答がありませんでした";
      continue;
    }

    return { ok: true, reply, model };
  }

  return { ok: false, status: lastStatus, message: lastMessage };
}
