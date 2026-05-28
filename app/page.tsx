import { AppDataProvider } from "@/components/AppDataProvider";
import { CalendarPanes } from "@/components/CalendarPanes";
import { DataMenu } from "@/components/DataMenu";
import { NorthStarBar } from "@/components/NorthStarBar";
import { DIAGRAM_IMPROVEMENTS_URL, DIAGRAM_PUBLIC_URL } from "@/lib/constants";

export default function Home() {
  return (
    <AppDataProvider>
      <div className="min-h-full bg-white px-3 py-4 text-black sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-black">
                人生のカレンダー
              </h1>
              <p className="text-sm text-black/70">
                Life Calendar — 年・月・週・日で実行スケジュールを俯瞰し未来を創造し思考を現実化させる
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DataMenu />
              <a
                href={DIAGRAM_IMPROVEMENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-50"
              >
                設計図解
              </a>
              <a
                href={DIAGRAM_PUBLIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-black/75 hover:bg-zinc-100"
              >
                画面図解
              </a>
            </div>
          </div>

          <article className="rounded-xl border border-zinc-300 bg-white shadow-sm">
            <NorthStarBar />
            <CalendarPanes />
            <footer className="flex items-center justify-center gap-2 border-t border-zinc-200 bg-white px-4 py-2.5 text-xs text-black/60">
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
