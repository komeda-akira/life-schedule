"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/AppDataProvider";
import {
  linkedPhilosophyText,
  linkedVisionCenterSummary,
  linkedVisionText,
} from "@/lib/goal-setting-linked-content";
import {
  cellRole,
  createExampleExpansionGrid,
  isThemeAnchorCell,
  isVisionCell,
  setExpansionCell,
  type ThinkingExpansionGrid,
} from "@/lib/thinking-expansion-sheet";
import {
  TES_BLOCK_ORIGINS,
  TES_CENTER_BLOCK,
  TES_CENTER_EMPTY,
  TES_CENTER_LABEL,
  TES_DEFAULT_THEMES,
  TES_EXAMPLE_TITLE,
  TES_INPUT_HINT,
  TES_INTRO,
  TES_LEGEND_DETAIL,
  TES_LEGEND_PHILOSOPHY,
  TES_LEGEND_THEME,
  TES_LINKED_HEADER_HINT,
  TES_MODAL_TITLE,
  TES_PHILOSOPHY_LINK_EMPTY,
  TES_PHILOSOPHY_LINK_LABEL,
  TES_STEP_LABEL,
  TES_SYNC_HINT,
  TES_THEME_HINT_TITLE,
  TES_VISION_LINK_EMPTY,
  TES_VISION_LINK_LABEL,
} from "@/lib/thinking-expansion-sheet-content";

const BLOCK_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

const cellInputClass =
  "min-h-[3.25rem] w-full resize-none bg-transparent px-1.5 py-1.5 text-[11px] leading-snug text-zinc-800 placeholder:text-zinc-400/80 focus:outline-none sm:min-h-[3.75rem] sm:px-2 sm:py-2 sm:text-xs sm:leading-relaxed";

function blockShellClass(blockIndex: number): string {
  if (blockIndex === TES_CENTER_BLOCK) {
    return "rounded-xl border border-red-200/60 bg-gradient-to-br from-red-50/50 via-violet-50/60 to-indigo-50/40 p-1 shadow-sm ring-1 ring-red-100/70";
  }
  return "rounded-xl border border-zinc-200/70 bg-white/95 p-1 shadow-sm";
}

function cellSurfaceClass(row: number, col: number): string {
  const role = cellRole(row, col);
  const base =
    "h-full rounded-md border transition-[background-color,border-color,box-shadow] duration-150 ";

  switch (role) {
    case "vision":
      return (
        base +
        " border-red-200/60 bg-white/90 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
      );
    case "theme":
      return `${base} border-sky-200/60 bg-sky-50/90 font-medium text-sky-950`;
    case "outer-center":
      return `${base} border-amber-200/60 bg-amber-50/80 font-medium text-amber-950`;
    default:
      return (
        base +
        " border-zinc-100/90 bg-zinc-50/40 hover:border-violet-200/50 hover:bg-white focus-within:border-violet-300/60 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(167,139,250,0.15)]"
      );
  }
}

function cellPlaceholder(row: number, col: number): string {
  const role = cellRole(row, col);
  if (role === "vision") return "";
  const themeIndex = isThemeAnchorCell(row, col);
  if (themeIndex != null) {
    return TES_DEFAULT_THEMES[themeIndex] ?? "";
  }
  if (role === "outer-center") return "テーマ";
  return "";
}

function cellAriaLabel(row: number, col: number): string {
  const role = cellRole(row, col);
  if (role === "vision") return TES_CENTER_LABEL;
  const themeIndex = isThemeAnchorCell(row, col);
  if (themeIndex != null) {
    return `テーマ ${themeIndex + 1}`;
  }
  if (role === "outer-center") return "外側ブロックのテーマ";
  return `${row + 1}行${col + 1}列`;
}

function CenterVisionCell({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) {
  if (!line1 && !line2) {
    return (
      <div className="flex min-h-[5rem] items-center justify-center px-2 py-2 text-center text-[11px] leading-relaxed text-zinc-400 sm:min-h-[5.5rem] sm:text-xs">
        {TES_CENTER_EMPTY}
      </div>
    );
  }

  const totalLen = (line1 + line2).length;
  const compact = totalLen > 28;

  return (
    <div className="flex min-h-[5rem] flex-col items-center justify-center gap-0.5 px-1.5 py-2 text-center sm:min-h-[5.5rem] sm:px-2">
      <span
        className={`font-bold leading-tight text-red-800 ${
          compact ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs"
        }`}
      >
        {line1}
      </span>
      {line2 ? (
        <span
          className={`font-semibold leading-snug text-zinc-800 ${
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px]"
          }`}
        >
          {line2}
        </span>
      ) : null}
    </div>
  );
}

function LinkedPhilosophyPanel({ text }: { text: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 px-3 py-3 sm:px-4">
      <p className="text-[10px] font-bold tracking-wide text-emerald-900/85 sm:text-[11px]">
        {TES_PHILOSOPHY_LINK_LABEL}
      </p>
      <p
        className={`mt-1.5 text-sm leading-relaxed sm:text-[15px] sm:leading-relaxed ${
          text ? "font-medium text-zinc-800" : "text-zinc-400"
        }`}
      >
        {text || TES_PHILOSOPHY_LINK_EMPTY}
      </p>
    </div>
  );
}

function LinkedVisionPanel({ text }: { text: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/40 px-3 py-3 sm:px-4">
      <p className="text-[10px] font-bold tracking-wide text-violet-900/85 sm:text-[11px]">
        {TES_VISION_LINK_LABEL}
      </p>
      <p
        className={`mt-1.5 text-sm leading-relaxed sm:text-[15px] sm:leading-relaxed ${
          text ? "font-medium text-zinc-800" : "text-zinc-400"
        }`}
      >
        {text || TES_VISION_LINK_EMPTY}
      </p>
    </div>
  );
}

function ExpansionGrid({
  grid,
  onChange,
  readOnly,
  philosophyLinked,
  visionCenter,
  linkedVision,
}: {
  grid: ThinkingExpansionGrid;
  onChange?: (grid: ThinkingExpansionGrid) => void;
  readOnly?: boolean;
  philosophyLinked?: string;
  visionCenter?: { line1: string; line2: string };
  linkedVision?: string;
}) {
  const showLinkedHeader =
    !readOnly &&
    (philosophyLinked != null || visionCenter != null || linkedVision != null);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50/40 via-white to-sky-50/30 p-2 sm:p-3">
      {showLinkedHeader ? (
        <div className="mb-2 sm:mb-3">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <LinkedPhilosophyPanel text={philosophyLinked ?? ""} />
            <LinkedVisionPanel text={linkedVision ?? ""} />
          </div>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">
            {TES_LINKED_HEADER_HINT}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {BLOCK_INDICES.map((blockIndex) => (
          <div key={blockIndex} className={blockShellClass(blockIndex)}>
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
              {Array.from({ length: 9 }, (_, localIndex) => {
                const localR = Math.floor(localIndex / 3);
                const localC = localIndex % 3;
                const [originR, originC] = TES_BLOCK_ORIGINS[blockIndex];
                const r = originR + localR;
                const c = originC + localC;
                const value = grid[r]?.[c] ?? "";
                const isCenterPhilosophy = isVisionCell(r, c);

                return (
                  <div key={`${r}-${c}`} className={cellSurfaceClass(r, c)}>
                    {isCenterPhilosophy && !readOnly && visionCenter ? (
                      <CenterVisionCell
                        line1={visionCenter.line1}
                        line2={visionCenter.line2}
                      />
                    ) : readOnly ? (
                      <div className="flex min-h-[3.25rem] items-center justify-center px-1.5 py-1.5 text-center text-[10px] leading-snug text-zinc-700 sm:min-h-[3.75rem] sm:text-[11px]">
                        {value ? (
                          <span className="whitespace-pre-wrap">{value}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          onChange?.(setExpansionCell(grid, r, c, e.target.value))
                        }
                        placeholder={cellPlaceholder(r, c)}
                        rows={2}
                        className={cellInputClass}
                        aria-label={cellAriaLabel(r, c)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridLegend() {
  const items = [
    {
      label: TES_LEGEND_PHILOSOPHY,
      className: "bg-red-50/90 border-red-200/60",
    },
    { label: TES_LEGEND_THEME, className: "bg-sky-50/90 border-sky-200/60" },
    { label: TES_LEGEND_DETAIL, className: "bg-zinc-50/80 border-zinc-200/70" },
  ] as const;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-zinc-600 sm:text-[11px]">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/80 px-2.5 py-1"
        >
          <span className={`h-3 w-3 rounded-sm border ${item.className}`} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function ThinkingExpansionSheetView() {
  const { getGoalSetting, updateGoalSetting, getPurposeVision, getLifePhilosophy } =
    useAppData();
  const data = getGoalSetting();
  const sheet = data.thinkingExpansion;
  const exampleGrid = createExampleExpansionGrid();
  const philosophy = getLifePhilosophy();
  const philosophyLinked = linkedPhilosophyText(
    philosophy,
    data.lifePhilosophy,
  );
  const visionCenter = linkedVisionCenterSummary(
    getPurposeVision(),
    data.lifeVision,
  );
  const linkedVision = linkedVisionText(getPurposeVision(), data.lifeVision);

  const updateGrid = useCallback(
    (cells: ThinkingExpansionGrid) => {
      updateGoalSetting({ thinkingExpansion: { cells } });
    },
    [updateGoalSetting],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 font-sans text-zinc-800 sm:gap-5">
      <header className="text-center">
        <p className="text-xs font-bold tracking-wide text-violet-700/90">
          {TES_STEP_LABEL}
        </p>
        <h3 className="mt-1 text-lg font-bold tracking-tight text-zinc-900">
          {TES_MODAL_TITLE}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{TES_INTRO}</p>
      </header>

      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-3 py-3 text-[11px] leading-relaxed text-zinc-600 sm:px-4">
        <p className="font-semibold text-zinc-700">{TES_CENTER_LABEL}</p>
        <p className="mt-1">{TES_SYNC_HINT}</p>
        <p className="mt-2 text-zinc-500">{TES_INPUT_HINT}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium text-violet-800/90">
            {TES_THEME_HINT_TITLE}
          </summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {TES_DEFAULT_THEMES.map((theme) => (
              <li key={theme} className="text-zinc-600">
                · {theme}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <GridLegend />

      <div className="overflow-x-auto pb-1">
        <ExpansionGrid
          grid={sheet.cells}
          onChange={updateGrid}
          philosophyLinked={philosophyLinked}
          visionCenter={visionCenter}
          linkedVision={linkedVision}
        />
      </div>

      <details className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 sm:p-4">
        <summary className="cursor-pointer text-xs font-bold text-zinc-700">
          {TES_EXAMPLE_TITLE}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <ExpansionGrid grid={exampleGrid} readOnly />
        </div>
      </details>
    </div>
  );
}
