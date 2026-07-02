import type { RoleFrequencyPresetId } from "@/lib/role-goal-worksheet-content";
import { getFrequencyPreset, ROLE_FREQUENCY_PRESETS } from "@/lib/role-goal-worksheet-content";

export type { RoleFrequencyPresetId };

export type RoleGoalPhase = {
  label: string;
  years: string;
  hoursPerDay: string;
  frequencyPreset: RoleFrequencyPresetId | "";
  daysPerYear: string;
};

export type RoleGoalRow = {
  role: string;
  keyPeople: string;
  phases: RoleGoalPhase[];
  description: string;
};

export const DEFAULT_ROLE_GOAL_ROW_COUNT = 3;
export const DEFAULT_PHASE_COUNT = 1;

export function createEmptyRoleGoalPhase(): RoleGoalPhase {
  return {
    label: "",
    years: "",
    hoursPerDay: "",
    frequencyPreset: "",
    daysPerYear: "",
  };
}

export function createEmptyRoleGoalRow(): RoleGoalRow {
  return {
    role: "",
    keyPeople: "",
    phases: Array.from({ length: DEFAULT_PHASE_COUNT }, createEmptyRoleGoalPhase),
    description: "",
  };
}

function mergeField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function inferFrequencyPreset(daysPerYear: number): RoleFrequencyPresetId {
  if (daysPerYear <= 0) return "custom";

  let best: RoleFrequencyPresetId = "custom";
  let bestDiff = Infinity;

  for (const preset of ROLE_FREQUENCY_PRESETS) {
    if (preset.id === "custom") continue;
    const diff = Math.abs(preset.daysPerYear - daysPerYear);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = preset.id;
    }
  }

  return bestDiff <= 3 ? best : "custom";
}

export function resolvePhaseDaysPerYear(phase: RoleGoalPhase): number | null {
  const preset = getFrequencyPreset(phase.frequencyPreset);
  if (preset && preset.id !== "custom") {
    return preset.daysPerYear;
  }
  return parseNumber(phase.daysPerYear);
}

export function applyFrequencyPreset(
  phase: RoleGoalPhase,
  presetId: RoleFrequencyPresetId,
): RoleGoalPhase {
  const preset = getFrequencyPreset(presetId);
  if (!preset) return phase;

  if (preset.id === "custom") {
    return { ...phase, frequencyPreset: "custom" };
  }

  return {
    ...phase,
    frequencyPreset: preset.id,
    daysPerYear: String(preset.daysPerYear),
  };
}

function normalizeRoleGoalPhase(input: unknown): RoleGoalPhase {
  if (!input || typeof input !== "object") return createEmptyRoleGoalPhase();
  const phase = input as Partial<RoleGoalPhase>;
  const daysPerYear = mergeField(phase.daysPerYear);
  const frequencyPreset = mergeField(phase.frequencyPreset) as
    | RoleFrequencyPresetId
    | "";

  let normalizedPreset = frequencyPreset;
  if (!normalizedPreset && daysPerYear) {
    const days = parseNumber(daysPerYear);
    if (days != null) {
      normalizedPreset = inferFrequencyPreset(days);
    }
  }

  return {
    label: mergeField(phase.label),
    years: mergeField(phase.years),
    hoursPerDay: mergeField(phase.hoursPerDay),
    frequencyPreset: normalizedPreset,
    daysPerYear,
  };
}

function normalizePhases(input: unknown): RoleGoalPhase[] {
  if (!Array.isArray(input) || input.length === 0) {
    return Array.from({ length: DEFAULT_PHASE_COUNT }, createEmptyRoleGoalPhase);
  }
  const phases = input.map(normalizeRoleGoalPhase).slice(0, DEFAULT_PHASE_COUNT);
  while (phases.length < DEFAULT_PHASE_COUNT) {
    phases.push(createEmptyRoleGoalPhase());
  }
  return phases;
}

type LegacyRoleGoalRow = RoleGoalRow & {
  remainingYears?: string;
  daysPerYear?: string;
  hoursPerDay?: string;
};

function migrateLegacyRow(row: LegacyRoleGoalRow): RoleGoalRow {
  if (Array.isArray(row.phases) && row.phases.length > 0) {
    return {
      role: mergeField(row.role),
      keyPeople: mergeField(row.keyPeople),
      phases: normalizePhases(row.phases),
      description: mergeField(row.description),
    };
  }

  const years = mergeField(row.remainingYears);
  const daysPerYear = mergeField(row.daysPerYear);
  const hoursPerDay = mergeField(row.hoursPerDay);
  if (years || daysPerYear || hoursPerDay) {
    const days = parseNumber(daysPerYear || "365") ?? 365;
    return {
      role: mergeField(row.role),
      keyPeople: mergeField(row.keyPeople),
      phases: [
        {
          label: "",
          years,
          hoursPerDay,
          frequencyPreset: inferFrequencyPreset(days),
          daysPerYear: daysPerYear || "365",
        },
      ],
      description: mergeField(row.description),
    };
  }

  return {
    role: mergeField(row.role),
    keyPeople: mergeField(row.keyPeople),
    phases: normalizePhases(undefined),
    description: mergeField(row.description),
  };
}

function normalizeRoleGoalRow(input: unknown): RoleGoalRow {
  if (!input || typeof input !== "object") return createEmptyRoleGoalRow();
  return migrateLegacyRow(input as LegacyRoleGoalRow);
}

export function normalizeRoleGoalRows(input: unknown): RoleGoalRow[] {
  if (!Array.isArray(input)) {
    return Array.from({ length: DEFAULT_ROLE_GOAL_ROW_COUNT }, createEmptyRoleGoalRow);
  }
  const rows = input.map(normalizeRoleGoalRow);
  while (rows.length < DEFAULT_ROLE_GOAL_ROW_COUNT) {
    rows.push(createEmptyRoleGoalRow());
  }
  return rows;
}

export type RoleTimePhaseResult = {
  label: string;
  daysPerYear: number;
  years: number;
  hoursPerDay: number;
  totalDays: number;
  totalHours: number;
  shareOfSpan: number;
  line: string;
  detailLine: string;
};

export type RoleTimeStats = {
  phases: RoleTimePhaseResult[];
  totalDays: number;
  totalHours: number;
  totalSpanYears: number;
  equivalentYears: number;
  avgDaysPerYear: number;
  avgHoursPerDay: number;
  avgHoursPerMonth: number;
  hasData: boolean;
};

export function computeRoleTimeStats(phases: RoleGoalPhase[]): RoleTimeStats {
  const results: RoleTimePhaseResult[] = [];
  let totalDays = 0;
  let totalHours = 0;
  let totalSpanYears = 0;

  for (const phase of phases) {
    const daysPerYear = resolvePhaseDaysPerYear(phase);
    const years = parseNumber(phase.years);
    if (daysPerYear == null || years == null || daysPerYear <= 0 || years <= 0) {
      continue;
    }

    const hoursPerDay = parseNumber(phase.hoursPerDay) ?? 0;
    const phaseDays = Math.round(daysPerYear * years);
    const phaseHours = Math.round(hoursPerDay * phaseDays);
    totalDays += phaseDays;
    totalSpanYears += years;
    totalHours += phaseHours;

    const label = phase.label.trim();
    const prefix = label ? `〈${label}〉` : "";
    results.push({
      label: phase.label,
      daysPerYear,
      years,
      hoursPerDay,
      totalDays: phaseDays,
      totalHours: phaseHours,
      shareOfSpan: 0,
      line: `${prefix}${daysPerYear}日×${years}年＝${phaseDays.toLocaleString("ja-JP")}日`,
      detailLine:
        hoursPerDay > 0
          ? `約${phaseHours.toLocaleString("ja-JP")}時間（${hoursPerDay}時間/日）`
          : `${phaseDays.toLocaleString("ja-JP")}日`,
    });
  }

  const spanForShare = totalSpanYears > 0 ? totalSpanYears : 1;
  for (const result of results) {
    result.shareOfSpan = result.years / spanForShare;
  }

  return {
    phases: results,
    totalDays,
    totalHours,
    totalSpanYears,
    equivalentYears: totalDays / 365,
    avgDaysPerYear: totalSpanYears > 0 ? totalDays / totalSpanYears : 0,
    avgHoursPerDay: totalDays > 0 ? totalHours / totalDays : 0,
    avgHoursPerMonth:
      totalSpanYears > 0 ? totalHours / (totalSpanYears * 12) : 0,
    hasData: totalDays > 0,
  };
}

export function formatEquivalentYears(years: number): string {
  if (!Number.isFinite(years) || years <= 0) return "";
  const rounded = Math.round(years * 100) / 100;
  return `${rounded.toLocaleString("ja-JP")}年`;
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0時間";
  return `${Math.round(hours).toLocaleString("ja-JP")}時間`;
}
