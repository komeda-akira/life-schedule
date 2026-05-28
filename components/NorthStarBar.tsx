"use client";

import { useState } from "react";
import { LifeWishList100Modal } from "@/components/LifeWishList100Modal";
import { My100YearHistoryModal } from "@/components/My100YearHistoryModal";
import { NorthStarModal } from "@/components/NorthStarModal";
import { useAppData } from "@/components/AppDataProvider";
import { excerptComment } from "@/lib/calendar";
import { LIFE_WISH_LIST_100_LABEL } from "@/lib/life-wish-list-100";
import { MY_100_YEAR_HISTORY_LABEL } from "@/lib/my-100-year-history";
import { goalSettingBarExcerpt } from "@/lib/goal-setting";
import { primeTimeSheetDataExcerpt } from "@/lib/prime-time-sheet";
import { defaultNorthStarTitle } from "@/lib/north-star-seeds";
import { purposeVisionBarLines } from "@/lib/purpose-vision";
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

const northStarBtnClass =
  "flex flex-col items-start rounded-md border border-zinc-300 bg-white px-4 py-2 text-left text-sm font-medium text-black shadow-sm hover:bg-zinc-100";

const compactAuxBtnClass =
  "flex min-h-0 flex-1 flex-col items-start justify-center rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-left shadow-sm hover:bg-zinc-100";

const compactTitleClass = "text-[11px] font-medium leading-snug text-black";

const compactWishListBtnClass =
  "flex flex-1 flex-col items-start justify-center overflow-visible rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-left shadow-sm hover:bg-zinc-100";

const compactWishListTitleClass =
  "text-[10.5px] font-medium leading-[1.5] tracking-tight text-black";

export function NorthStarBar({ className = "" }: NorthStarBarProps) {
  const [open, setOpen] = useState<NorthStarCategory | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wishListOpen, setWishListOpen] = useState(false);
  const {
    northStarFor,
    getLifePhilosophy,
    getPurposeVision,
    getGoalSetting,
    getPrimeTimeSheetData,
  } = useAppData();

  const purposeBarLines = purposeVisionBarLines(getPurposeVision());

  const excerptFor = (cat: NorthStarCategory) => {
    if (cat === "vision") return null;
    if (cat === "purpose") return null;
    if (cat === "goal") {
      return goalSettingBarExcerpt(getGoalSetting());
    }
    if (cat === "prime") {
      const ex = primeTimeSheetDataExcerpt(getPrimeTimeSheetData());
      return ex ? excerptComment(ex, 32) : "";
    }
    return excerptComment(
      northStarFor(cat)[0]?.title.trim() || defaultNorthStarTitle(cat),
      32,
    );
  };

  const philosophy = getLifePhilosophy();
  const visionWord = excerptComment(philosophy.coreWord.trim() || "利他", 14);
  const visionNote = philosophy.coreNote.trim();

  return (
    <>
      <div
        className={`border-b border-zinc-200 bg-white px-3 py-2.5 ${className}`}
        role="toolbar"
        aria-label="北極星（理念・目的・ビジョン・目標・プライムシート・自分100年史・やりたいこと100）"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const goalBarText = cat === "goal" ? excerptFor("goal") : "";

            if (cat === "prime") {
              return (
                <div
                  key="prime-group"
                  className="flex items-stretch gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setOpen("prime")}
                    className={`${northStarBtnClass} max-w-[11rem]`}
                  >
                    <span>{NORTH_STAR_LABELS.prime}</span>
                    <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug">
                      <span className="font-normal text-black/60">
                        {excerptFor("prime")}
                      </span>
                    </span>
                  </button>
                  <div className="flex w-[11.25rem] min-w-0 flex-col gap-1 self-stretch overflow-visible">
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(true)}
                      className={compactAuxBtnClass}
                    >
                      <span className={compactTitleClass}>
                        {MY_100_YEAR_HISTORY_LABEL}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishListOpen(true)}
                      className={compactWishListBtnClass}
                    >
                      <span className={compactWishListTitleClass}>
                        {LIFE_WISH_LIST_100_LABEL}
                      </span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setOpen(cat)}
                className={`${northStarBtnClass} ${
                  cat === "purpose" || cat === "goal"
                    ? "max-w-[14.5rem] min-w-[11.5rem]"
                    : "max-w-[11rem]"
                }`}
              >
                <span>{NORTH_STAR_LABELS[cat]}</span>
                <span className="mt-0.5 line-clamp-2 leading-snug">
                  {cat === "vision" ? (
                    <>
                      <span className="text-base font-bold text-red-700">
                        {visionWord}
                      </span>
                      {visionNote ? (
                        <span className="text-[10px] text-black/60">
                          （{visionNote}）
                        </span>
                      ) : null}
                    </>
                  ) : cat === "purpose" ? (
                    <span className="flex w-full flex-col gap-0.5 text-[10px] font-bold leading-[1.4] text-red-700">
                      {purposeBarLines.line1 ? (
                        <span className="line-clamp-2">{purposeBarLines.line1}</span>
                      ) : null}
                      {purposeBarLines.line2 ? (
                        <span className="line-clamp-2">{purposeBarLines.line2}</span>
                      ) : null}
                    </span>
                  ) : cat === "goal" ? (
                    goalBarText ? (
                      <span className="flex w-full flex-col text-[10px] font-bold leading-[1.35] text-red-700">
                        <span className="line-clamp-3">{goalBarText}</span>
                      </span>
                    ) : null
                  ) : (
                    <span className="text-[10px] font-normal text-black/60">
                      {excerptFor(cat)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {open ? (
        <NorthStarModal category={open} onClose={() => setOpen(null)} />
      ) : null}
      {historyOpen ? (
        <My100YearHistoryModal onClose={() => setHistoryOpen(false)} />
      ) : null}
      {wishListOpen ? (
        <LifeWishList100Modal onClose={() => setWishListOpen(false)} />
      ) : null}
    </>
  );
}

