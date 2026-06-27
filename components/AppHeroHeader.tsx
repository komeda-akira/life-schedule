import type { ReactNode } from "react";

const TIME_SCOPES = [
  { label: "年", className: "border-amber-200 bg-amber-50 text-amber-900" },
  { label: "月", className: "border-sky-200 bg-sky-50 text-sky-900" },
  { label: "週", className: "border-violet-200 bg-violet-50 text-violet-900" },
  { label: "日", className: "border-emerald-200 bg-emerald-50 text-emerald-900" },
] as const;

function CalendarMark() {
  return (
    <div
      className="grid h-12 w-12 shrink-0 grid-cols-2 grid-rows-2 gap-1 rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-sm"
      aria-hidden
    >
      {TIME_SCOPES.map((scope) => (
        <span
          key={scope.label}
          className={`flex items-center justify-center rounded-md text-[10px] font-bold ${scope.className}`}
        >
          {scope.label}
        </span>
      ))}
    </div>
  );
}

type AppHeroHeaderProps = {
  toolbar: ReactNode;
};

export function AppHeroHeader({ toolbar }: AppHeroHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-amber-50/50 px-5 py-4 shadow-sm sm:px-6 sm:py-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-100/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/4 h-28 w-28 rounded-full bg-sky-200/30 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-3 sm:gap-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            <CalendarMark />
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">
                Life Calendar
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
                人生のカレンダー
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            {toolbar}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm leading-relaxed text-zinc-700 sm:text-base">
            {TIME_SCOPES.map((scope, i) => (
              <span key={scope.label} className="inline-flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-zinc-300" aria-hidden>
                    ·
                  </span>
                ) : null}
                <span
                  className={`inline-flex min-w-[2rem] items-center justify-center rounded-lg border px-2 py-0.5 text-sm font-bold shadow-sm ${scope.className}`}
                >
                  {scope.label}
                </span>
              </span>
            ))}
            <span className="text-zinc-600">
              の時間軸で、実行スケジュールを一望
            </span>
          </p>
          <p className="text-base font-semibold leading-snug text-zinc-800 sm:text-lg">
            未来を創造し、
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              思考を現実化
            </span>
            する
          </p>
        </div>
      </div>
    </header>
  );
}
