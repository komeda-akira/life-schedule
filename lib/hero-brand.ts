/** ヘッダー左の英語名とキーフレーズで共有するブランドトーン */

export const HERO_KEY_PHRASE = "思考は現実化する";

export const heroBrandColors = {
  accent: "text-amber-700",
  body: "text-zinc-600",
  accentGradient:
    "bg-gradient-to-r from-amber-600 via-emerald-600 to-sky-500 bg-clip-text text-transparent",
  divider: "text-amber-300/90",
} as const;

export const heroBrandEnglishClass =
  "shrink-0 whitespace-nowrap text-sm font-extrabold uppercase leading-none tracking-[0.14em] sm:text-base sm:tracking-[0.16em]";

export const heroBrandKeyPhraseClass =
  "min-w-0 text-base font-bold leading-none tracking-tight sm:text-lg";
