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
