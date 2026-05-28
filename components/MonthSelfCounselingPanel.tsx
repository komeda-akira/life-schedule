import {
  MONTH_SELF_COUNSELING_ITEMS,
  MONTH_SELF_COUNSELING_TITLE,
} from "@/lib/month-self-counseling";

function CounselLine({ text, lead }: { text: string; lead?: boolean }) {
  const parts = text.split(/(「[^」]+」)/g);

  return (
    <span
      className={
        lead
          ? "block text-[15px] font-semibold leading-snug text-black"
          : "block text-[14px] font-medium leading-snug text-black/85"
      }
    >
      {parts.map((part, i) =>
        /^「.+」$/.test(part) ? (
          <strong key={i} className="font-bold text-red-800">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/** 月ペイン下部の余白に表示するセルフカウンセリング */
export function MonthSelfCounselingPanel() {
  return (
    <aside
      className="h-full rounded-md border border-red-200/60 bg-gradient-to-b from-red-50/30 to-zinc-50/50 px-3 py-3.5"
      aria-label={MONTH_SELF_COUNSELING_TITLE}
    >
      <h3 className="border-b border-red-200/70 pb-2 text-center font-serif text-[17px] font-bold tracking-wide text-red-700">
        {MONTH_SELF_COUNSELING_TITLE}
      </h3>
      <ol className="mt-3 space-y-3.5 font-serif">
        {MONTH_SELF_COUNSELING_ITEMS.map((item) => (
          <li key={item.no} className="flex gap-2.5">
            <span
              className="w-5 shrink-0 text-right text-[17px] font-bold leading-snug text-red-700 tabular-nums"
              aria-hidden
            >
              {item.no}
            </span>
            <span className="min-w-0 flex-1 space-y-1 border-l-2 border-red-100 pl-2.5">
              {item.lines.map((line, idx) => (
                <CounselLine
                  key={line}
                  text={line}
                  lead={idx === 0 || item.lines.length === 1}
                />
              ))}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
