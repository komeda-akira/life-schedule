type ClaudeGenerateResult =
  | { ok: true; reply: string; model: string }
  | { ok: false; status: number; message: string };

type ClaudeMessagesResponse = {
  content?: Array<{ type?: string; text?: string }>;
  error?: { message?: string; type?: string };
};

function extractReply(data: ClaudeMessagesResponse): string {
  return (
    data.content
      ?.filter((p) => p.type === "text" && p.text)
      .map((p) => p.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

export function formatClaudeApiError(status: number, errText: string): string {
  try {
    const parsed = JSON.parse(errText) as {
      error?: { message?: string; type?: string };
    };
    const msg = parsed.error?.message ?? errText;
    if (status === 429 || /rate.?limit|overloaded/i.test(msg)) {
      return "Claude API の利用上限に達しました。数分待って再試行してください。";
    }
    if (status === 401 || status === 403 || /api.?key|authentication|permission/i.test(msg)) {
      return "Claude API キーが無効です。Anthropic Console でキーを確認してください。";
    }
    if (status === 404 || /not.?found|model/i.test(msg)) {
      return "指定した Claude モデルが利用できません。ANTHROPIC_MODEL を確認してください。";
    }
    return `Claude API エラー: ${msg.slice(0, 200)}`;
  } catch {
    return "Claude API の呼び出しに失敗しました";
  }
}

export async function generateClaudeReply(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
): Promise<ClaudeGenerateResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0.7,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Claude API error", model, res.status, errText);
    return {
      ok: false,
      status: res.status,
      message: formatClaudeApiError(res.status, errText),
    };
  }

  const data = (await res.json()) as ClaudeMessagesResponse;
  const reply = extractReply(data);
  if (!reply) {
    return {
      ok: false,
      status: 502,
      message: "AI から応答がありませんでした",
    };
  }

  return { ok: true, reply, model };
}
