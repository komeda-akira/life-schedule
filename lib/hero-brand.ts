/** ヘッダー左の英語名とキーフレーズで共有するブランドトーン（経営者向け・さわやか） */

export const HERO_KEY_PHRASE = "思考は現実化する";

export const heroBrandColors = {
  accent: "text-amber-700",
  body: "text-zinc-600",
  /** キーフレーズの前後 — 落ち着いたスレート */
  keyPhraseLead: "text-slate-600",
  /** 「現実化」— ティール→エメラルド→スカイ（信頼感・清潔感） */
  keyPhraseAccent:
    "bg-gradient-to-r from-teal-700 via-emerald-600 to-sky-600 bg-clip-text text-transparent",
  divider: "text-teal-200/90",
} as const;

export const heroBrandEnglishClass =
  "shrink-0 whitespace-nowrap text-sm font-extrabold uppercase leading-none tracking-[0.14em] sm:text-base sm:tracking-[0.16em]";

/** 経営向け画面 — 読みやすさ優先のセミボールド */
export const heroBrandKeyPhraseClass =
  "min-w-0 text-base font-semibold leading-snug tracking-wide sm:text-lg";

/** ヘッダー横の「成功のステップ」— キーフレーズと同系のティール */
export const heroSuccessStepsButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-teal-200/90 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:px-3 sm:text-sm";

export const heroSuccessStepsArrowClass = "text-teal-600/70";
