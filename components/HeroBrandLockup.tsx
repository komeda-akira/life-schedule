import { SuccessStepsButton } from "@/components/SuccessStepsButton";
import {
  heroBrandColors,
  heroBrandEnglishClass,
  heroBrandKeyPhraseClass,
} from "@/lib/hero-brand";

/** Life Calendar とキーフレーズを同一トーンで横並びにするブランドロックアップ */
export function HeroBrandLockup() {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1.5 sm:gap-x-2.5">
      <p className={heroBrandEnglishClass} aria-label="Life Calendar">
        <span className={heroBrandColors.accent}>Life</span>
        <span className={heroBrandColors.body}> Calendar</span>
      </p>

      <span
        className={`hidden shrink-0 select-none text-sm font-light sm:inline ${heroBrandColors.divider}`}
        aria-hidden
      >
        /
      </span>

      <h1 className={heroBrandKeyPhraseClass}>
        <span className={heroBrandColors.keyPhraseLead}>思考は</span>
        <span className={heroBrandColors.keyPhraseAccent}>現実化</span>
        <span className={heroBrandColors.keyPhraseLead}>する</span>
      </h1>

      <div className="self-center sm:self-auto sm:translate-y-px">
        <SuccessStepsButton />
      </div>
    </div>
  );
}
