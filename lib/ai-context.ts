import type { AppData } from "@/lib/types";

/** Gemini 用にアプリデータの要約テキストを生成 */
export function buildAiContext(data: AppData): string {
  const lines: string[] = [];

  if (data.events.length > 0) {
    const upcoming = [...data.events]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 30);
    lines.push("【直近の予定（最大30件）】");
    for (const e of upcoming) {
      const time =
        e.kind === "allDay"
          ? "終日"
          : `${Math.floor((e.startMin ?? 0) / 60)}:${String((e.startMin ?? 0) % 60).padStart(2, "0")}`;
      const recur = e.recurrence ? `（繰り返し:${e.recurrence.freq}）` : "";
      lines.push(`- ${e.date} ${time} ${e.title}${recur}`);
      if (e.memo) lines.push(`  メモ: ${e.memo.slice(0, 120)}`);
    }
  }

  const plan = data.midLongTermPlan;
  if (plan?.priorityGoal?.trim()) {
    lines.push("\n【中長期の最重点目標】");
    lines.push(plan.priorityGoal.trim());
  }
  if (plan?.goals?.some((g) => g.trim())) {
    lines.push("\n【中長期の目標】");
    plan.goals.forEach((g, i) => {
      if (g.trim()) lines.push(`${i + 1}. ${g.trim()}`);
    });
  }

  if (data.purposeVision?.lifePurposeLead?.trim()) {
    lines.push("\n【人生の目的】");
    lines.push(data.purposeVision.lifePurposeLead.trim().slice(0, 500));
  }
  if (data.purposeVision?.visionMain?.trim()) {
    lines.push("\n【ビジョン】");
    lines.push(data.purposeVision.visionMain.trim().slice(0, 500));
  }

  const scopeEntries = Object.entries(data.scopeComments ?? {}).filter(
    ([, v]) => v.trim(),
  );
  if (scopeEntries.length > 0) {
    lines.push("\n【年/月/週コメント】");
    for (const [k, v] of scopeEntries.slice(0, 8)) {
      lines.push(`${k}: ${v.trim().slice(0, 200)}`);
    }
  }

  return lines.join("\n") || "（まだデータがありません）";
}
