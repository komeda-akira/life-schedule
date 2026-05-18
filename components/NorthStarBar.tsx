"use client";

import { useState } from "react";
import { NorthStarModal } from "@/components/NorthStarModal";
import { NORTH_STAR_LABELS, type NorthStarCategory } from "@/lib/types";

const CATEGORIES: NorthStarCategory[] = [
  "vision",
  "purpose",
  "goal",
  "prime",
];

type NorthStarBarProps = {
  className?: string;
};

export function NorthStarBar({ className = "" }: NorthStarBarProps) {
  const [open, setOpen] = useState<NorthStarCategory | null>(null);

  return (
    <>
      <div
        className={`border-b border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80 ${className}`}
        role="toolbar"
        aria-label="北極星（理念・目的・目標・プライムシート）"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setOpen(cat)}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {NORTH_STAR_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>
      {open ? (
        <NorthStarModal category={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
