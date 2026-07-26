"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type AiAssistantPanelProps = {
  buildContext: () => string;
};

const EXAMPLE_PROMPTS = [
  "今週の予定を整理して",
  "中長期目標に向けた今月の行動を提案して",
  "選択理論に基づいた例を中期計画に記載して",
] as const;

export function AiAssistantPanel({ buildContext }: AiAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/claude/status");
        if (!res.ok) return;
        const body = (await res.json()) as { configured?: boolean };
        if (!cancelled) setConfigured(body.configured === true);
      } catch {
        if (!cancelled) setConfigured(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const send = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;
      setInput("");
      setError(null);
      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", text },
      ];
      setMessages(nextMessages);
      setLoading(true);
      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            context: buildContext(),
          }),
        });
        const body = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          if (res.status === 503) setConfigured(false);
          throw new Error(body.error ?? "AI への問い合わせに失敗しました");
        }
        setConfigured(true);
        setMessages([
          ...nextMessages,
          { role: "assistant", text: body.reply ?? "" },
        ]);
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    },
    [buildContext, input, loading, messages],
  );

  const canSend = configured !== false && !loading;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-1.5 text-xs font-semibold text-violet-900 hover:border-violet-400"
      >
        <span aria-hidden>✦</span>
        AI に相談
        <OpenLayerArrow className="text-violet-700/60" />
      </button>

      {open ? (
        <Modal title="Claude AI アシスタント" onClose={() => setOpen(false)} wide>
          <div className="flex flex-col gap-3">
            <p className="text-xs leading-relaxed text-black/65">
              予定・北極星・ワークシートの概要をもとに、計画や振り返りについて質問できます。
              API キーはサーバー側のみで使用されます。
            </p>

            {configured === false ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
                <p className="font-semibold">Claude API キーの設定が必要です</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4">
                  <li>
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900"
                    >
                      Anthropic Console
                    </a>
                    {" "}で API キーを作成
                  </li>
                  <li>
                    ローカル:{" "}
                    <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                      .env.local
                    </code>
                    {" "}に{" "}
                    <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                      ANTHROPIC_API_KEY=あなたのキー
                    </code>
                    {" "}を追加し、開発サーバーを再起動
                  </li>
                  <li>
                    本番（Vercel）: Project Settings → Environment Variables に{" "}
                    <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                      ANTHROPIC_API_KEY
                    </code>
                    {" "}を追加して再デプロイ
                  </li>
                </ol>
              </div>
            ) : null}

            <div
              ref={listRef}
              className="flex max-h-[min(24rem,50vh)] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/80 p-3"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-black/45">例をクリックして質問できます</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={!canSend}
                        onClick={() => void send(prompt)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-xs leading-snug text-blue-900 transition hover:border-blue-300 hover:bg-blue-100/80 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-8 rounded-lg bg-blue-600 px-3 py-2 text-xs text-white"
                        : "mr-4 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs leading-relaxed text-black/85"
                    }
                  >
                    {m.text}
                  </div>
                ))
              )}
              {loading ? (
                <p className="text-xs text-black/45">考え中…</p>
              ) : null}
            </div>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder={
                  configured === false
                    ? "API キー設定後に質問できます"
                    : "質問を入力（Enter で送信）"
                }
                disabled={!canSend}
                className="min-h-[3rem] flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100 disabled:text-black/45"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!canSend || !input.trim()}
                className="shrink-0 self-end rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40"
              >
                送信
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
