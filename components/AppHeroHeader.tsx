import type { ReactNode } from "react";

const TIME_SCOPES = [
  { label: "年", className: "border-amber-200/80 bg-amber-50/80 text-amber-800" },
  { label: "月", className: "border-sky-200/80 bg-sky-50/80 text-sky-800" },
  { label: "週", className: "border-violet-200/80 bg-violet-50/80 text-violet-800" },
  { label: "日", className: "border-emerald-200/80 bg-emerald-50/80 text-emerald-800" },
] as const;

function CalendarMark() {
  return (
    <div
      className="grid h-7 w-7 shrink-0 grid-cols-2 grid-rows-2 gap-px rounded-md border border-zinc-200/80 bg-white p-0.5"
      aria-hidden
    >
      {TIME_SCOPES.map((scope) => (
        <span
          key={scope.label}
          className={`flex items-center justify-center rounded-[3px] text-[7px] font-bold ${scope.className}`}
        >
          {scope.label}
        </span>
      ))}
    </div>
  );
}

type AppHeroHeaderProps = {
  toolbar: ReactNode;
  northStar?: ReactNode;
};

export function AppHeroHeader({ toolbar, northStar }: AppHeroHeaderProps) {
  return (
    <header className="rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-amber-50/30 px-2.5 py-2 shadow-sm sm:px-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <CalendarMark />
            <div className="min-w-0 leading-none">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Life Calendar
              </p>
              <h1 className="mt-0.5 text-xs font-bold text-zinc-600">
                人生のカレンダー
              </h1>
              <p className="mt-1 hidden items-center gap-x-1 text-[9px] leading-none text-zinc-400 xl:flex">
                {TIME_SCOPES.map((scope, i) => (
                  <span key={scope.label} className="inline-flex items-center gap-1">
                    {i > 0 ? (
                      <span className="text-zinc-300" aria-hidden>
                        ·
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex min-w-[1rem] items-center justify-center rounded border px-0.5 py-px text-[8px] font-semibold ${scope.className}`}
                    >
                      {scope.label}
                    </span>
                  </span>
                ))}
                <span>の時間軸で一望</span>
              </p>
            </div>
          </div>

          <p className="min-w-0 flex-1 text-center text-lg font-black leading-none tracking-tight text-zinc-900 sm:text-left sm:text-xl">
            思考は
            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              現実化
            </span>
            する
          </p>

          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
            {toolbar}
          </div>
        </div>

        {northStar ? <div className="min-w-0">{northStar}</div> : null}

        <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] leading-none text-zinc-400 xl:hidden">
          {TIME_SCOPES.map((scope, i) => (
            <span key={scope.label} className="inline-flex items-center gap-1">
              {i > 0 ? (
                <span className="text-zinc-300" aria-hidden>
                  ·
                </span>
              ) : null}
              <span
                className={`inline-flex min-w-[1rem] items-center justify-center rounded border px-0.5 py-px text-[9px] font-semibold ${scope.className}`}
              >
                {scope.label}
              </span>
            </span>
          ))}
          <span>の時間軸で、実行スケジュールを一望</span>
        </p>
      </div>
    </header>
  );
}
