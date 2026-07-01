"use client";

import { useCallback, useState } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { LifeWishList100Guide } from "@/components/LifeWishList100Guide";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import {
  LIFE_WISH_LIST_100_COLUMNS,
  LIFE_WISH_LIST_100_LABEL,
  LIFE_WISH_LIST_100_SAVE_HINT,
} from "@/lib/life-wish-list-100";
import { LW100_GUIDE_BUTTON } from "@/lib/life-wish-list-100-guide-content";

const entryInputClass =
  "min-w-0 flex-1 border-0 border-b border-dotted border-zinc-400 bg-transparent px-0.5 py-0.5 text-xs text-black placeholder:text-black/30 focus:border-zinc-600 focus:outline-none";

export function LifeWishList100View() {
  const { getLifeWishList100, updateLifeWishList100 } = useAppData();
  const data = getLifeWishList100();
  const [guideOpen, setGuideOpen] = useState(false);

  const setItem = useCallback(
    (index: number, value: string) => {
      const items = [...data.items];
      items[index] = value;
      updateLifeWishList100({ items });
    },
    [data.items, updateLifeWishList100],
  );

  return (
    <div className="flex flex-col gap-3 font-sans text-black">
      <div className="border-b border-zinc-300 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight">
            {LIFE_WISH_LIST_100_LABEL}
          </h3>
          <button
            type="button"
            onClick={() => setGuideOpen((open) => !open)}
            aria-expanded={guideOpen}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-3 py-2 text-xs font-bold text-rose-950 shadow-sm transition-all hover:border-rose-400 hover:shadow-md"
          >
            {LW100_GUIDE_BUTTON}
            <OpenLayerArrow
              className={`text-rose-700/70 transition-transform ${guideOpen ? "rotate-90" : ""}`}
            />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-black/55">
          {LIFE_WISH_LIST_100_SAVE_HINT}
        </p>
      </div>

      {guideOpen ? <LifeWishList100Guide /> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LIFE_WISH_LIST_100_COLUMNS.map(({ start, end }) => (
          <div
            key={start}
            className="overflow-hidden rounded-md border border-zinc-300 bg-white"
          >
            <ul className="divide-y divide-zinc-200">
              {Array.from({ length: end - start + 1 }, (_, i) => {
                const num = start + i;
                const index = num - 1;
                const stripe = num % 2 === 0;
                return (
                  <li
                    key={num}
                    className={`flex items-center gap-1 px-1.5 py-0.5 ${
                      stripe ? "bg-zinc-100/90" : "bg-white"
                    }`}
                  >
                    <span className="flex h-6 w-7 shrink-0 items-center justify-center text-xs font-semibold tabular-nums text-black/80">
                      {num}
                    </span>
                    <input
                      type="text"
                      value={data.items[index] ?? ""}
                      onChange={(e) => setItem(index, e.target.value)}
                      className={entryInputClass}
                      aria-label={`\u3084\u308a\u305f\u3044\u3053\u3068 ${num}`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
