"use client";

import { useCallback } from "react";
import { PyramidWithSuccessSteps } from "@/components/PyramidWithSuccessSteps";
import { useAppData } from "@/components/AppDataProvider";
import {
  LIFE_PHILOSOPHY_REASON_COUNT,
  PYRAMID_LAYERS_BOTTOM_UP,
  type LifePhilosophy,
  type PyramidLayerDef,
} from "@/lib/life-philosophy";
import {
  VISION_CORE_NOTE_LABEL,
  VISION_CORE_QUESTION,
  VISION_KEYWORDS_HINT,
  VISION_KEYWORDS_LABEL,
  VISION_LIFE_PHILOSOPHY_TITLE,
  VISION_PYRAMID_AXIS_BOTTOM,
  VISION_PYRAMID_AXIS_LABEL,
  VISION_PYRAMID_AXIS_TOP,
  VISION_PYRAMID_BODY,
  VISION_PYRAMID_CLOSING,
  VISION_PYRAMID_HIGHLIGHT,
  VISION_PYRAMID_INTRO,
  VISION_PYRAMID_TITLE,
  VISION_SAVE_HINT,
  VISION_STEP_LABEL,
  VISION_SUCCESS_QUESTION,
} from "@/lib/vision-philosophy-content";

const PYRAMID_GEOMETRY = {
  apexY: 14,
  baseY: 286,
  baseHalf: 158,
  /** ピラミッド中心（右寄せで左に矢印用の余白を確保） */
  cx: 262,
  arrowGap: 22,
  labelGap: 28,
  arrowHead: 10,
} as const;

function getPyramidLayout() {
  const { cx, baseHalf, arrowGap, labelGap, apexY, baseY } = PYRAMID_GEOMETRY;
  const pyramidLeft = cx - baseHalf;
  const arrowX = pyramidLeft - arrowGap;
  const labelX = arrowX - labelGap;
  const width = cx + baseHalf + 24;
  const height = baseY + 14;
  return {
    cx,
    apexY,
    baseY,
    baseHalf,
    arrowX,
    labelX,
    width,
    height,
    pyramidLeft,
  };
}

function pyramidHalfWidth(y: number): number {
  const { apexY, baseY, baseHalf } = PYRAMID_GEOMETRY;
  const t = (y - apexY) / (baseY - apexY);
  return Math.max(0, t * baseHalf);
}

function layerTrapezoidPoints(
  indexFromTop: number,
  layerCount: number,
): string {
  const { cx, apexY, baseY } = PYRAMID_GEOMETRY;
  const step = (baseY - apexY) / layerCount;
  const y0 = apexY + indexFromTop * step;
  const y1 = apexY + (indexFromTop + 1) * step;
  const w0 = pyramidHalfWidth(y0);
  const w1 = pyramidHalfWidth(y1);
  return [
    `${cx - w0},${y0}`,
    `${cx + w0},${y0}`,
    `${cx + w1},${y1}`,
    `${cx - w1},${y1}`,
  ].join(" ");
}

function PyramidLayerText({
  layer,
  y0,
  y1,
}: {
  layer: PyramidLayerDef;
  y0: number;
  y1: number;
}) {
  const { cx } = PYRAMID_GEOMETRY;
  const cy = (y0 + y1) / 2;
  const band = y1 - y0;
  const titleSize = band < 52 ? 11 : 12;
  const subSize = 9;

  return (
    <>
      <text
        x={cx}
        y={cy - (layer.sub ? 5 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={titleSize}
        fontWeight={layer.foundation ? 700 : 600}
        fill={layer.foundation ? "#7f1d1d" : "#18181b"}
      >
        {layer.label}
      </text>
      {layer.sub ? (
        <text
          x={cx}
          y={cy + 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={subSize}
          fill={layer.foundation ? "#991b1b" : "#52525b"}
        >
          {layer.sub}
        </text>
      ) : null}
    </>
  );
}

function PyramidAxisArrow({
  apexY,
  baseY,
  arrowX,
  labelX,
}: {
  apexY: number;
  baseY: number;
  arrowX: number;
  labelX: number;
}) {
  const { arrowHead } = PYRAMID_GEOMETRY;
  const shaftTop = apexY + 12;
  const shaftBottom = baseY - 8;
  const tipY = shaftTop;
  const shaftEndY = tipY + arrowHead;
  const label = VISION_PYRAMID_AXIS_LABEL;
  const chars = [...label];
  const labelTop = shaftTop + 14;
  const labelBottom = shaftBottom - 14;
  const step =
    chars.length > 1 ? (labelBottom - labelTop) / (chars.length - 1) : 0;

  return (
    <g aria-hidden>
      <line
        x1={arrowX}
        y1={shaftBottom}
        x2={arrowX}
        y2={shaftEndY}
        stroke="#52525b"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        shapeRendering="geometricPrecision"
      />
      <polygon
        points={`${arrowX},${tipY} ${arrowX - 6},${tipY + arrowHead} ${arrowX + 6},${tipY + arrowHead}`}
        fill="#52525b"
        shapeRendering="geometricPrecision"
      />
      {chars.map((ch, i) => (
        <text
          key={`${ch}-${i}`}
          x={labelX}
          y={labelTop + i * step}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="600"
          fill="#3f3f46"
        >
          {ch}
        </text>
      ))}
      <text
        x={arrowX - 8}
        y={tipY + 4}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize="9"
        fill="#71717a"
      >
        {VISION_PYRAMID_AXIS_TOP}
      </text>
      <text
        x={arrowX - 8}
        y={shaftBottom}
        textAnchor="end"
        dominantBaseline="auto"
        fontSize="9"
        fill="#b91c1c"
        fontWeight="600"
      >
        {VISION_PYRAMID_AXIS_BOTTOM}
      </text>
    </g>
  );
}

function LifePhilosophyPyramid() {
  const layersTopToBottom = [...PYRAMID_LAYERS_BOTTOM_UP].reverse();
  const layout = getPyramidLayout();
  const { width, height, cx, apexY, baseY, arrowX, labelX } = layout;
  const step = (baseY - apexY) / layersTopToBottom.length;
  const outline = `${cx},${apexY} ${cx + pyramidHalfWidth(baseY)},${baseY} ${cx - pyramidHalfWidth(baseY)},${baseY}`;

  return (
    <figure className="mx-auto w-full max-w-lg">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full drop-shadow-sm"
        role="img"
        aria-label={`人生のピラミッド。左の矢印は${VISION_PYRAMID_AXIS_LABEL}。下から人生理念、人生ビジョン、目標の設定、計画化、日々の実践`}
      >
        <defs>
          <linearGradient
            id="pyramid-foundation"
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#fef2f2" />
          </linearGradient>
          <linearGradient id="pyramid-upper" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="100%" stopColor="#f4f4f5" />
          </linearGradient>
        </defs>
        <PyramidAxisArrow
          apexY={apexY}
          baseY={baseY}
          arrowX={arrowX}
          labelX={labelX}
        />
        <polygon
          points={outline}
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {layersTopToBottom.map((layer, i) => {
          const y0 = apexY + i * step;
          const y1 = apexY + (i + 1) * step;
          return (
            <g key={layer.label}>
              <polygon
                points={layerTrapezoidPoints(i, layersTopToBottom.length)}
                fill={
                  layer.foundation
                    ? "url(#pyramid-foundation)"
                    : "url(#pyramid-upper)"
                }
                stroke={layer.foundation ? "#ef4444" : "#a1a1aa"}
                strokeWidth="1.25"
              />
              <PyramidLayerText layer={layer} y0={y0} y1={y1} />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-center text-[10px] text-black/55">
        理念（土台）から実践へ — 一貫性を持たせて積み上げる
      </figcaption>
    </figure>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-black placeholder:text-black/35 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

export function VisionPhilosophyView() {
  const { getLifePhilosophy, updateLifePhilosophy } = useAppData();
  const philosophy = getLifePhilosophy();

  const patch = useCallback(
    (partial: Partial<LifePhilosophy>) => {
      updateLifePhilosophy(partial);
    },
    [updateLifePhilosophy],
  );

  const setKeyword = (index: number, value: string) => {
    const keywords = [...philosophy.keywords];
    while (keywords.length <= index) keywords.push("");
    keywords[index] = value;
    patch({ keywords });
  };

  const addKeyword = () => {
    patch({ keywords: [...philosophy.keywords, ""] });
  };

  const removeKeyword = (index: number) => {
    patch({
      keywords: philosophy.keywords.filter((_, i) => i !== index),
    });
  };

  const setReason = (index: number, value: string) => {
    const successReasons = [...philosophy.successReasons] as string[];
    successReasons[index] = value;
    patch({
      successReasons: successReasons as LifePhilosophy["successReasons"],
    });
  };

  const visibleKeywords = philosophy.keywords.length
    ? philosophy.keywords
    : [""];

  return (
    <div className="flex flex-col gap-8 text-sm leading-relaxed text-black">
      <section className="flex flex-col gap-4">
        <h3 className="text-center text-lg font-bold tracking-wide">
          {VISION_PYRAMID_TITLE}
        </h3>
        <p className="text-black/85">{VISION_PYRAMID_INTRO}</p>
        <PyramidWithSuccessSteps pyramid={<LifePhilosophyPyramid />} />
        <p className="text-black/85">{VISION_PYRAMID_BODY}</p>
        <p className="rounded-md border border-pink-200 bg-pink-50 px-3 py-2.5 text-black/90">
          {VISION_PYRAMID_HIGHLIGHT}
        </p>
        <p className="text-black/85">{VISION_PYRAMID_CLOSING}</p>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold">{VISION_LIFE_PHILOSOPHY_TITLE}</h3>
          <p className="text-xs text-black/60">{VISION_STEP_LABEL}</p>
        </div>
        <p className="text-[11px] text-black/55">{VISION_SAVE_HINT}</p>

        <div>
          <p className="mb-1 text-xs font-semibold text-black/70">
            {VISION_KEYWORDS_LABEL}
          </p>
          <p className="mb-2 text-[11px] text-black/55">
            {VISION_KEYWORDS_HINT}
          </p>
          <ul className="flex flex-col gap-2">
            {visibleKeywords.map((word, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-[10px] text-black/45">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setKeyword(index, e.target.value)}
                  placeholder="例：誠実"
                  className={inputClass}
                />
                {visibleKeywords.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="shrink-0 text-xs text-red-600 underline"
                    aria-label={`キーワード${index + 1}を削除`}
                  >
                    削除
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addKeyword}
            className="mt-2 text-xs font-medium text-black underline"
          >
            ＋ キーワードを追加
          </button>
        </div>

        <div>
          <p className="mb-2 font-medium text-black/90">
            {VISION_SUCCESS_QUESTION}
          </p>
          <ol className="flex flex-col gap-2">
            {Array.from({ length: LIFE_PHILOSOPHY_REASON_COUNT }, (_, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-xs font-medium text-black/70">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={philosophy.successReasons[i]}
                  onChange={(e) => setReason(i, e.target.value)}
                  placeholder={`理由${i + 1}`}
                  className={inputClass}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border-2 border-zinc-300 bg-zinc-50 px-4 py-3">
          <p className="text-xs text-black/65">{VISION_CORE_QUESTION}</p>
          <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <input
              type="text"
              value={philosophy.coreWord}
              onChange={(e) => patch({ coreWord: e.target.value })}
              placeholder="一言"
              className={`${inputClass} max-w-[12rem] text-center text-xl font-bold text-red-700`}
              aria-label="一言で表す言葉"
            />
          </div>
          <label className="mt-3 flex flex-col gap-1">
            <span className="text-[11px] text-black/60">
              {VISION_CORE_NOTE_LABEL}
            </span>
            <input
              type="text"
              value={philosophy.coreNote}
              onChange={(e) => patch({ coreNote: e.target.value })}
              placeholder="成功の土台"
              className={`${inputClass} text-center text-sm`}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
