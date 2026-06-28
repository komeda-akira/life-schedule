import type { ReactNode } from "react";
import { HeroBrandLockup } from "@/components/HeroBrandLockup";

type AppHeroHeaderProps = {
  toolbar: ReactNode;
  northStar?: ReactNode;
};

export function AppHeroHeader({ toolbar, northStar }: AppHeroHeaderProps) {
  return (
    <header className="rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-amber-50/30 px-2.5 py-2 shadow-sm sm:px-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <HeroBrandLockup />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">{toolbar}</div>
        </div>

        {northStar ? <div className="min-w-0">{northStar}</div> : null}
      </div>
    </header>
  );
}
