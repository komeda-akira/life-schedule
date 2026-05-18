import { AppDataProvider } from "@/components/AppDataProvider";
import { CalendarPanes } from "@/components/CalendarPanes";
import { DataMenu } from "@/components/DataMenu";
import { NorthStarBar } from "@/components/NorthStarBar";
import { DIAGRAM_PUBLIC_URL } from "@/lib/constants";

export default function Home() {
  return (
    <AppDataProvider>
      <div className="min-h-full bg-neutral-200 px-3 py-4 sm:px-6 sm:py-8 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                人生のカレンダー
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Life Calendar — 年・月・週・日で実行スケジュールを俯瞰する
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DataMenu />
              <a
                href={DIAGRAM_PUBLIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
              >
                設計図解
              </a>
            </div>
          </div>

          <article className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <NorthStarBar />
            <CalendarPanes />
            <footer className="flex items-center justify-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <span className="opacity-70" aria-hidden>
                ▣
              </span>
              <span>広い画面：4列 / 狭い画面：タブ切替</span>
            </footer>
          </article>
        </div>
      </div>
    </AppDataProvider>
  );
}
