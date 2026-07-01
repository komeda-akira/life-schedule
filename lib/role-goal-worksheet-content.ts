/** Step3 役割ごとに目標を考える — 目標シート用 */

export const ROLE_GOAL_TITLE = "役割ごとに目標を考える";

export const ROLE_GOAL_STEP_LABEL = "Step3 明確な「目標」を設定する";

export const ROLE_GOAL_BUTTON_SUBTITLE =
  "役割・鍵となる人・残り時間・目標を整理する";

export const ROLE_GOAL_MODAL_TITLE = "Step3 役割ごとに目標を考える";

export const ROLE_GOAL_INTRO =
  "配偶者、親、上司・部下、友人など、自分の役割を明確にすることで、良好な関係を保つために何をすべきか、役割ごとに目標を設定できます。";

export const ROLE_GOAL_THINKING_TITLE = "役割を考える";

export const ROLE_GOAL_THINKING_BODY =
  "自分が果たしている役割を書き出し、それぞれについて「鍵となる人々」と「役割を果たせる時間」を考え、目標を記入してください。";

export const ROLE_GOAL_TIME_GUIDE_TITLE =
  "「役割を果たせる時間」を考えるために";

export const ROLE_GOAL_TIME_GUIDE_ITEMS = [
  "その役割が終わる日から逆算して、あと何年その役割を果たせるか？",
  "期間ごとに、どのくらいの頻度で関わるか（ほぼ毎日・週末中心・年数回など）",
  "関わる日は、1日あたり何時間をこの役割に使うか？",
] as const;

export const ROLE_GOAL_COL_ROLE = "役割";
export const ROLE_GOAL_COL_KEY_PEOPLE = "鍵となる人々";
export const ROLE_GOAL_COL_TIME = "役割を果たせる時間";
export const ROLE_GOAL_COL_DESCRIPTION = "説明";

export const ROLE_GOAL_EXAMPLE_LABEL = "例";
export const ROLE_GOAL_ROW_PREFIX = "役割";

export const ROLE_GOAL_PHASE_LABEL = "期間";
export const ROLE_GOAL_YEARS_LABEL = "あと何年？";
export const ROLE_GOAL_YEARS_SUFFIX = "年";
export const ROLE_GOAL_FREQUENCY_LABEL = "どのくらいの頻度で関わる？";
export const ROLE_GOAL_HOURS_PER_DAY_LABEL = "関わる日は1日何時間？";
export const ROLE_GOAL_HOURS_SUFFIX = "時間/日";
export const ROLE_GOAL_PHASE_DAYS_PER_YEAR_LABEL = "1年あたりの日数";
export const ROLE_GOAL_ADD_PHASE = "期間を追加";
export const ROLE_GOAL_ADD_ROW = "役割を追加";
export const ROLE_GOAL_REMOVE_PHASE = "削除";

export const ROLE_GOAL_PLAN_SUMMARY_TITLE = "計画サマリー";
export const ROLE_GOAL_PLAN_REMAINING = "残り期間";
export const ROLE_GOAL_PLAN_ROLE_DAYS = "役割に使える日数";
export const ROLE_GOAL_PLAN_ROLE_HOURS = "役割に使える時間";
export const ROLE_GOAL_PLAN_MONTHLY = "月あたり目安";
export const ROLE_GOAL_PLAN_EQUIVALENT = "毎日フルコミ換算";
export const ROLE_GOAL_PLAN_TIMELINE = "期間のイメージ";
export const ROLE_GOAL_PLAN_EMPTY =
  "期間・頻度・時間を入力すると、ここに計画の全体像が表示されます。";

export const ROLE_GOAL_EXAMPLE = {
  role: "親",
  keyPeople: "長男 翔太、長女 唯",
  phases: [
    {
      label: "高校卒業まで",
      years: "5",
      hoursPerDay: "8",
      frequencyPreset: "daily",
      daysPerYear: "365",
    },
    {
      label: "大学進学後",
      years: "40",
      hoursPerDay: "8",
      frequencyPreset: "occasional",
      daysPerYear: "9",
    },
  ],
  description:
    "各自が自立の精神を持って、自らの手で物質的・精神的に豊かな人生を築けるよう、最大限の情報と必要な生活支援を行う。可能性を信じ、励まし、安心・安全な居場所をつくる。",
} as const;

export type RoleFrequencyPresetId =
  | "daily"
  | "weekend"
  | "weekly"
  | "monthly"
  | "occasional"
  | "custom";

export type RoleFrequencyPreset = {
  id: RoleFrequencyPresetId;
  label: string;
  daysPerYear: number;
  hint: string;
};

export const ROLE_FREQUENCY_PRESETS: RoleFrequencyPreset[] = [
  { id: "daily", label: "ほぼ毎日", daysPerYear: 365, hint: "365日/年" },
  { id: "weekend", label: "週末中心", daysPerYear: 104, hint: "約104日/年" },
  { id: "weekly", label: "週1程度", daysPerYear: 52, hint: "52日/年" },
  { id: "monthly", label: "月1程度", daysPerYear: 12, hint: "12日/年" },
  { id: "occasional", label: "年数回", daysPerYear: 9, hint: "9日/年" },
  { id: "custom", label: "自分で指定", daysPerYear: 0, hint: "日数を入力" },
];

export function getFrequencyPreset(
  id: RoleFrequencyPresetId | "",
): RoleFrequencyPreset | undefined {
  if (!id) return undefined;
  return ROLE_FREQUENCY_PRESETS.find((preset) => preset.id === id);
}
