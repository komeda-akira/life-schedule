"use client";

import { useState } from "react";
import { NorthStarModal } from "@/components/NorthStarModal";
import { useAppData } from "@/components/AppDataProvider";
import { excerptComment } from "@/lib/calendar";
import { defaultNorthStarTitle } from "@/lib/north-star-seeds";
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
  const { northStarFor, getLifePhilosophy } = useAppData();

  const excerptFor = (cat: NorthStarCategory) => {
    if (cat !== "vision") {
      return excerptComment(
        northStarFor(cat)[0]?.title.trim() || defaultNorthStarTitle(cat),
        32,
      );
    }
    return null;
  };

  const philosophy = getLifePhilosophy();
  const visionWord = excerptComment(philosophy.coreWord.trim() || "利他", 14);
  const visionNote = philosophy.coreNote.trim();

  return (
    <>
      <div
        className={`border-b border-zinc-200 bg-white px-3 py-2.5 ${className}`}
        role="toolbar"
        aria-label="北極星（理念・目的・ビジョン・目標・プライムシート）"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setOpen(cat)}
              className="flex max-w-[11rem] flex-col items-start rounded-md border border-zinc-300 bg-white px-4 py-2 text-left text-sm font-medium text-black shadow-sm hover:bg-zinc-100"
            >
              <span>{NORTH_STAR_LABELS[cat]}</span>
              <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug">
                {cat === "vision" ? (
                  <>
                    <span className="font-semibold text-red-700">
                      {visionWord}
                    </span>
                    {visionNote ? (
                      <span className="text-black/60">（{visionNote}）</span>
                    ) : null}
                  </>
                ) : (
                  <span className="font-normal text-black/60">
                    {excerptFor(cat)}
                  </span>
                )}
              </span>
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
