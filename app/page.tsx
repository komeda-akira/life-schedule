import { AppDataProvider } from "@/components/AppDataProvider";
import { AppHeaderTools } from "@/components/AppHeaderTools";
import { AppHeroHeader } from "@/components/AppHeroHeader";
import { AuthShell, UserSessionBar } from "@/components/AuthShell";
import { CalendarNavigationProvider } from "@/components/CalendarNavigation";
import { CalendarPanes } from "@/components/CalendarPanes";
import { NorthStarBar } from "@/components/NorthStarBar";
import { Providers } from "@/components/Providers";

export default function Home() {
  return (
    <Providers>
      <AuthShell>
        <CalendarNavigationProvider>
        <AppDataProvider>
      <div className="min-h-full bg-gradient-to-b from-zinc-100/80 via-zinc-50/40 to-white px-3 py-4 text-black sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
          <AppHeroHeader
            toolbar={
              <>
                <AppHeaderTools />
                <UserSessionBar />
              </>
            }
          />

          <article className="overflow-hidden rounded-2xl border border-zinc-300/90 bg-white shadow-md">
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
        </CalendarNavigationProvider>
      </AuthShell>
    </Providers>
  );
}
