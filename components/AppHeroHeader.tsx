import type { ReactNode } from "react";

type AppHeroHeaderProps = {
  toolbar: ReactNode;
  northStar?: ReactNode;
};

export function AppHeroHeader({ toolbar, northStar }: AppHeroHeaderProps) {
  return (
    <header className="rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-amber-50/30 px-2.5 py-2 shadow-sm sm:px-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-4">
            <p
              className="shrink-0 whitespace-nowrap border-r border-amber-200/90 pr-3 text-sm font-extrabold uppercase leading-none tracking-[0.14em] sm:pr-4 sm:text-base sm:tracking-[0.16em]"
              aria-label="Life Calendar"
            >
              <span className="text-amber-700">Life</span>
              <span className="text-zinc-600"> Calendar</span>
            </p>
            <h1 className="min-w-0 text-xl font-black leading-none tracking-tight text-zinc-900 sm:text-2xl">
              思考は
              <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                現実化
              </span>
              する
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">{toolbar}</div>
        </div>

        {northStar ? <div className="min-w-0">{northStar}</div> : null}
      </div>
    </header>
  );
}
