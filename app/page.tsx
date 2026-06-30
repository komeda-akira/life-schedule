import { AppDataProvider } from "@/components/AppDataProvider";
import { AppHeaderTools } from "@/components/AppHeaderTools";
import { AppHeroHeader } from "@/components/AppHeroHeader";
import { AuthShell, UserSessionBar } from "@/components/AuthShell";
import { CalendarNavigationProvider } from "@/components/CalendarNavigation";
import { CalendarPanes } from "@/components/CalendarPanes";
import { LocalVaultGate } from "@/components/LocalVaultGate";
import { NorthStarBar } from "@/components/NorthStarBar";
import { Providers } from "@/components/Providers";

function AppShell() {
  return (
    <AuthShell>
      <CalendarNavigationProvider>
        <AppDataProvider>
          <div className="min-h-full bg-gradient-to-b from-zinc-100/80 via-zinc-50/40 to-white px-2 py-2 text-black sm:px-4 sm:py-3">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2">
              <AppHeroHeader
                northStar={<NorthStarBar variant="header" />}
                toolbar={
                  <>
                    <AppHeaderTools />
                    <UserSessionBar />
                  </>
                }
              />

              <article className="overflow-hidden rounded-xl border border-zinc-300/90 bg-white shadow-md">
                <CalendarPanes />
                <footer className="flex items-center justify-center gap-1.5 border-t border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-black/55">
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
  );
}

export default function Home() {
  return (
    <Providers>
      <LocalVaultGate>
        <AppShell />
      </LocalVaultGate>
    </Providers>
  );
}
