"use client";

import { useCallback, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type AiAssistantPanelProps = {
  buildContext: () => string;
};

export function AiAssistantPanel({ buildContext }: AiAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = input.trim();
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
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: buildContext(),
        }),
      });
      const body = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "AI への問い合わせに失敗しました");
      }
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
  }, [buildContext, input, loading, messages]);

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
        <Modal title="Gemini AI アシスタント" onClose={() => setOpen(false)} wide>
          <div className="flex flex-col gap-3">
            <p className="text-xs leading-relaxed text-black/65">
              予定・北極星・ワークシートの概要をもとに、計画や振り返りについて質問できます。
              API キーはサーバー側のみで使用されます。
            </p>
            <div
              ref={listRef}
              className="flex max-h-[min(24rem,50vh)] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/80 p-3"
            >
              {messages.length === 0 ? (
                <p className="text-xs text-black/45">
                  例:「今週の予定を整理して」「中長期目標に向けた今月の行動を提案して」
                </p>
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
                placeholder="質問を入力（Enter で送信）"
                className="min-h-[3rem] flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || !input.trim()}
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
