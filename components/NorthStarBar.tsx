"use client";

import { useState } from "react";
import { LifeWishList100Modal } from "@/components/LifeWishList100Modal";
import { My100YearHistoryModal } from "@/components/My100YearHistoryModal";
import { NorthStarModal } from "@/components/NorthStarModal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { useAppData } from "@/components/AppDataProvider";
import { excerptComment } from "@/lib/calendar";
import { LIFE_WISH_LIST_100_LABEL } from "@/lib/life-wish-list-100";
import { MY_100_YEAR_HISTORY_LABEL } from "@/lib/my-100-year-history";
import { goalSettingBarExcerpt } from "@/lib/goal-setting";
import { primeTimeSheetDataExcerpt } from "@/lib/prime-time-sheet";
import { purposeVisionBarLines } from "@/lib/purpose-vision";
import { NORTH_STAR_LABELS, type NorthStarCategory } from "@/lib/types";

const PRIMARY_CATEGORIES: NorthStarCategory[] = ["vision", "purpose", "goal"];

type NorthStarBarProps = {
  className?: string;
  variant?: "bar" | "header";
};

const northStarBtnClass =
  "relative flex flex-col items-start rounded-md border border-zinc-300 bg-white px-4 py-2 pr-7 text-left text-sm font-medium text-black shadow-sm hover:bg-zinc-100";

const headerPrimaryBtnClass =
  "group relative flex w-full min-h-0 flex-col rounded-lg border border-red-100/90 bg-white/95 px-2.5 py-2 pr-6 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/25";

const headerPrimaryLabelClass =
  "text-[11px] font-extrabold uppercase tracking-[0.1em] text-zinc-900 sm:text-xs";

const compactAuxBtnClass =
  "flex min-h-0 flex-1 items-center justify-between gap-1 rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-left shadow-sm hover:bg-zinc-100";

const compactTitleClass =
  "text-[11px] font-bold leading-snug text-zinc-900 sm:text-xs";

const compactWishListTitleClass =
  "text-[11px] font-bold leading-[1.5] tracking-tight text-zinc-900 sm:text-xs";

const compactWishListBtnClass =
  "flex flex-1 items-center justify-between gap-1 overflow-visible rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-left shadow-sm hover:bg-zinc-100";

const headerAuxBtnClass =
  "flex min-w-0 items-center justify-between gap-1 rounded-md border border-zinc-200 bg-white/90 px-2 py-1.5 text-left hover:bg-zinc-50";

function NorthStarOpenArrow({ className = "" }: { className?: string }) {
  return <OpenLayerArrow className={`text-[11px] ${className}`} />;
}

export function NorthStarBar({
  className = "",
  variant = "bar",
}: NorthStarBarProps) {
  const isHeader = variant === "header";
  const [open, setOpen] = useState<NorthStarCategory | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [wishListOpen, setWishListOpen] = useState(false);
  const {
    getLifePhilosophy,
    getPurposeVision,
    getGoalSetting,
    getPrimeTimeSheetData,
  } = useAppData();

  const purposeBarLines = purposeVisionBarLines(getPurposeVision());
  const goalBarText = goalSettingBarExcerpt(getGoalSetting());
  const primeExcerpt = (() => {
    const ex = primeTimeSheetDataExcerpt(getPrimeTimeSheetData());
    return ex ? excerptComment(ex, 32) : "";
  })();

  const philosophy = getLifePhilosophy();
  const visionWord = excerptComment(philosophy.coreWord.trim(), 14);
  const visionNote = philosophy.coreNote.trim();

  const renderPrimaryContent = (cat: NorthStarCategory) => {
    if (cat === "vision") {
      return (
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="text-xl font-black leading-none text-red-700 sm:text-2xl">
            {visionWord}
          </span>
          {visionNote ? (
            <span className="text-[11px] font-bold leading-none text-zinc-900 sm:text-xs">
              （{visionNote}）
            </span>
          ) : null}
        </span>
      );
    }

    if (cat === "purpose") {
      return (
        <span className="mt-0.5 flex w-full flex-col gap-0.5 text-[11px] font-bold leading-[1.4] text-red-700 sm:text-xs">
          {purposeBarLines.line1 ? (
            <span className="line-clamp-2">{purposeBarLines.line1}</span>
          ) : null}
          {purposeBarLines.line2 ? (
            <span className="line-clamp-1">{purposeBarLines.line2}</span>
          ) : null}
        </span>
      );
    }

    if (cat === "goal") {
      return goalBarText ? (
        <span className="mt-0.5 text-[11px] font-bold leading-[1.4] text-red-700 sm:text-xs">
          <span className="line-clamp-2">{goalBarText}</span>
        </span>
      ) : null;
    }

    return null;
  };

  const renderBarVariant = () => (
    <div className="flex flex-wrap gap-2">
      {(["vision", "purpose", "goal", "prime"] as const).map((cat) => {
        if (cat === "prime") {
          return (
            <div key="prime-group" className="flex items-stretch gap-1.5">
              <button
                type="button"
                onClick={() => setOpen("prime")}
                className={`${northStarBtnClass} max-w-[11rem]`}
              >
                <NorthStarOpenArrow className="absolute right-2 top-2" />
                <span className={headerPrimaryLabelClass}>{NORTH_STAR_LABELS.prime}</span>
                <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug">
                  <span className="font-normal text-black/60">{primeExcerpt}</span>
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
                  <NorthStarOpenArrow />
                </button>
                <button
                  type="button"
                  onClick={() => setWishListOpen(true)}
                  className={compactWishListBtnClass}
                >
                  <span className={compactWishListTitleClass}>
                    {LIFE_WISH_LIST_100_LABEL}
                  </span>
                  <NorthStarOpenArrow />
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
            <NorthStarOpenArrow className="absolute right-2 top-2" />
            <span className={headerPrimaryLabelClass}>{NORTH_STAR_LABELS[cat]}</span>
            <span className="mt-0.5 line-clamp-2 leading-snug">
              {cat === "vision" ? (
                <>
                  <span className="text-base font-bold text-red-700">
                    {visionWord}
                  </span>
                  {visionNote ? (
                    <span className="text-[10px] font-bold text-zinc-900">
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
              ) : goalBarText ? (
                <span className="flex w-full flex-col text-[10px] font-bold leading-[1.35] text-red-700">
                  <span className="line-clamp-3">{goalBarText}</span>
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderHeaderVariant = () => (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_auto] lg:items-stretch lg:gap-1.5">
      {PRIMARY_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => setOpen(cat)}
          className={headerPrimaryBtnClass}
        >
          <NorthStarOpenArrow className="absolute right-2 top-2" />
          <span className={headerPrimaryLabelClass}>
            {NORTH_STAR_LABELS[cat]}
          </span>
          {renderPrimaryContent(cat)}
        </button>
      ))}

      <div className="flex flex-wrap gap-1 sm:col-span-3 lg:col-span-1 lg:flex-col lg:justify-stretch">
        <button
          type="button"
          onClick={() => setOpen("prime")}
          className={`${headerAuxBtnClass} flex-1 px-2.5 py-2 lg:flex-none`}
        >
          <span className="text-sm font-bold leading-tight text-zinc-800 sm:text-base">
            {NORTH_STAR_LABELS.prime}
          </span>
          <NorthStarOpenArrow />
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className={`${headerAuxBtnClass} lg:flex-1`}
        >
          <span className="text-[11px] font-bold leading-tight text-zinc-900 sm:text-xs">
            {MY_100_YEAR_HISTORY_LABEL}
          </span>
          <NorthStarOpenArrow />
        </button>
        <button
          type="button"
          onClick={() => setWishListOpen(true)}
          className={`${headerAuxBtnClass} lg:flex-1`}
        >
          <span className="text-[11px] font-bold leading-tight text-zinc-900 sm:text-xs">
            {LIFE_WISH_LIST_100_LABEL}
          </span>
          <NorthStarOpenArrow />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`${
          isHeader
            ? "bg-transparent px-0 py-0"
            : "border-b border-zinc-200 bg-white px-3 py-2.5"
        } ${className}`}
        role="toolbar"
        aria-label="北極星（理念・目的・ビジョン・目標・プライムシート・自分100年史・やりたいこと100）"
      >
        {isHeader ? renderHeaderVariant() : renderBarVariant()}
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
