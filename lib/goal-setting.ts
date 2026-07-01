import type { AppData } from "@/lib/types";
import {
  normalizeRoleGoalRows,
  type RoleGoalRow,
} from "@/lib/role-goal-worksheet";
import {
  normalizeThinkingExpansionSheet,
  type ThinkingExpansionSheet,
} from "@/lib/thinking-expansion-sheet";

export type { RoleGoalRow, ThinkingExpansionSheet };

export type GoalHorizon = {
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
};

export type GoalDomainRow = {
  domainLabel: string;
  goals: GoalHorizon;
};

export type GoalNeedGroup = {
  needLabel: string;
  domains: GoalDomainRow[];
};

export type GoalSetting = {
  ownerName: string;
  createdDate: string;
  lifePhilosophy: string;
  lifeVision: string;
  groups: GoalNeedGroup[];
  /** Step3 役割ごとに目標を考える */
  roleGoals: RoleGoalRow[];
  /** Step3 思考拡張シート（マンダラチャート） */
  thinkingExpansion: ThinkingExpansionSheet;
};

function h(
  shortTerm: string,
  mediumTerm: string,
  longTerm: string,
): GoalHorizon {
  return { shortTerm, mediumTerm, longTerm };
}

function domain(domainLabel: string, goals: GoalHorizon): GoalDomainRow {
  return { domainLabel, goals };
}

function group(needLabel: string, domains: GoalDomainRow[]): GoalNeedGroup {
  return { needLabel, domains };
}

export const DEFAULT_GOAL_SETTING: GoalSetting = {
  ownerName: "\u7c1e\u7530 \u8f1d",
  createdDate: "2024\u5e745\u67085\u65e5",
  lifePhilosophy:
    "\u8aa0\u5b9f\u30fb\u611b\u30fb\u601d\u3044\u3084\u308a\u3001\u8cac\u4efb\u306e\u5fc3\u306e\u4f1d\u9054\u30fb\u9054\u6210",
  lifeVision:
    "\u4f1a\u8a08\u3092\u901a\u3058\u3066\u5bb6\u65cf\u306e\u767a\u5c55\u306e\u305f\u3081\u3072\u3044\u3066\u306f\u3001\u793e\u4f1a\u306e\u7e41\u69ae\u30fb\u5b89\u5168\u30fb\u5e73\u548c\u306b\u8ca2\u732e\u3059\u308b",
  groups: [
    group("\u751f\u5b58\u306e\u6b32\u6c42", [
      domain(
        "\u5065\u5eb7\u30fb\u4f53\u529b\u5206\u91ce",
        h(
          "\u8840\u5727120\u4ee5\u4e0b\uff1b\u6b6f\u79d1\u30e1\u30f3\u30c6\u67081\uff1b\u4f53\u91cd65kg\uff1b\u304a\u9152\u306f\u9031\u672b\u306e\u307f\uff1b10\u6642\u5c31\u5bdd\uff1b\u7b4b\u30c8\u30ec\uff08\u30b9\u30af\u30ef\u30c3\u30c8100\u56de/\u65e5\u3001\u8155\u7acb\u306620\u56de/\u65e5\uff09\uff1b\u30b8\u30e7\u30ae\u30f3\u30b0\uff082024\u5e745\u6708\uff09\uff1b\u30b9\u30c8\u30ec\u30c3\u30c1\uff06\u77e5\u60f3\uff15\u5206",
          "\u7981\u9152\uff1bICL\uff1b\u8131\u6bdb\uff1b\u30db\u30ef\u30a4\u30c8\u30cb\u30f3\u30b0",
          "75\u6b73\u307e\u3067\u73fe\u8077\u3067\u50cd\u3051\u308b\u5fc3\u8eab\u306e\u5065\u5eb7\u7dad\u6301",
        ),
      ),
    ]),
    group("\u611b\u30fb\u6240\u5c5e\u306e\u6b32\u6c42", [
      domain(
        "\u4eba\u9593\u95a2\u4fc2\u5206\u91ce",
        h(
          "\u4fe1\u983c\u3067\u304d\u308b\u30d3\u30b8\u30cd\u30b9\u30d1\u30fc\u30c8\u30ca\u30fc\uff13\u4eba\uff1b\u6642\u9593\u30fb\u671f\u9650\u56b4\u5b88\uff01\uff01\uff1b\u8003\u3048\u308b\u3088\u308a\u884c\u52d5\uff1b\uff082024\u5e745\u6708\uff09",
          "\u72ec\u7acb\u958b\u696d\u3057\u30d1\u30ef\u30fc\u30d1\u30fc\u30c8\u30ca\u30fc\u3068\u80b2\u3066\u308b\uff1b\u5e74\u55462\uff12\u5104\u5186",
          "\u5e74\u55462\uff11\uff10\u5104\u5186",
        ),
      ),
      domain(
        "\u5bb6\u65cf\u30fb\u5bb6\u5ead\u5206\u91ce",
        h(
          "\u5e74\uff12\u56de\u306e\u5927\u65c5\u884c\u30fb\u5e74\uff12\u56de\u306e\u5c0f\u65c5\u884c\uff1b\u9031\u672b\u306f\u4ed5\u4e8b\u3057\u306a\u3044\uff01\uff1b\u5618\u3092\u3064\u304b\u306a\u3044\uff01\uff1b\u5b9a\u6642\u3067\u5e30\u308b\uff01\uff1b\u6642\u9593\u56b4\u5b88\uff01\uff1b\uff082024\u5e745\u6708\uff09",
          "\u5bb6\u3092\u5efa\u3066\u308b\uff08\u30b9\u30a6\u30a7\u30fc\u30c7\u30f3\u30cf\u30a6\u30b9\uff09\uff1b\u5bb6\u65cf\u3067\u6d77\u5916\u65c5\u884c",
          "\u8001\u4eba\u30db\u30fc\u30e0\u8cc7\u91d1\u306e\u78ba\u4fdd",
        ),
      ),
    ]),
    group("\u529b\u306e\u6b32\u6c42", [
      domain(
        "\u4ed5\u4e8b\u30fb\u8077\u696d\u5206\u91ce",
        h(
          "\u77ed\u7b54\u5408\u683c\uff08\uff11\u65e5\uff11H\u52c9\u5f37\uff09\uff1b\u5f53\u305f\u308a\u524d\u306e\u3053\u3068\u3092\u6b63\u78ba\u306b\u8fc5\u901f\u306b\uff01\uff01\uff1b\u6bce\u670815\u65e5\u307e\u3067\u306b\u30bf\u30a4\u30e0\u30ea\u30fc\u304b\u3064\u6b63\u78ba\u306a\u8a66\u7b97\u8868\uff01\uff01\uff1b\uff082024\u5e745\u6708\uff09",
          "\u7a0e\u52d9\uff08\u76f8\u7d9a\u542b\u3080\uff09\uff1b\u7a0e\u52d9\u8abf\u67fb\u5168\u627f\u8a8d\uff08\u8aa0\u5b9f\u306b\uff09\uff1b\u9867\u5ba2\u5897\u30fbM&A\u5bfe\u5fdc",
          "",
        ),
      ),
      domain(
        "\u80fd\u529b\u958b\u767a\u5206\u91ce",
        h(
          "\u30a4\u30f3\u30d7\u30c3\u30c8\uff08\u7a0e\u52d9\u30fb\u4f1a\u8a08\u30fbAI\uff09\uff11\u65e5\uff11H\uff1b\u7d4c\u6e08\u30fb\u6570\u5b66\u30fb\u5fc3\u7406\u5b66\uff1b\uff082024\u5e745\u6708\uff09",
          "\u82f1\u8a9e\u30de\u30b9\u30bf\u30fc\uff1b\u30d7\u30ed\u30b0\u30e9\u30df\u30f3\u30b0\u00d7AI",
          "",
        ),
      ),
    ]),
    group("\u81ea\u7531\u306e\u6b32\u6c42", [
      domain(
        "\u7d4c\u6e08\u30fb\u84c4\u8ca1\u5206\u91ce",
        h(
          "\u5e74\u53ce\uff13\uff10\uff10\uff10\u4e07\u5186\uff1b\u6295\u8cc7\u6e96\u5099\uff08NISA\u53e3\u5ea7\u5909\u66f4\uff09\u7a4d\u7acb\u958b\u59cb\uff1b\uff082024\u5e745\u6708\uff09",
          "\u5e74\u53ce\u3092\u6bb5\u968e\u7684\u306b\u5897\u3084\u3059\uff1b\u6295\u8cc7\u3092\u52c9\u5f37\u3057\u306a\u304c\u3089\u5897\u3084\u3059",
          "\u5e74\u53ce\uff12\u5104\u5186",
        ),
      ),
    ]),
    group("\u697d\u3057\u307f\u306e\u6b32\u6c42", [
      domain(
        "\u8da3\u5473\u30fb\u6559\u990a\u5206\u91ce",
        h(
          "\u9031\u672b\u6599\u7406\uff08\u9031\uff12\u56de\uff09\uff1b\u5730\u7406\u30fb\u6b74\u53f2\uff1b\uff082024\u5e745\u6708\uff09",
          "\u82b8\u8853\uff1b\u697d\u5668\uff08\u30ae\u30bf\u30fc\u3001\u30c8\u30ed\u30f3\u30dc\u30fc\u30f3\uff09",
          "",
        ),
      ),
    ]),
  ],
  roleGoals: normalizeRoleGoalRows(undefined),
  thinkingExpansion: normalizeThinkingExpansionSheet(undefined),
};

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function emptyHorizon(): GoalHorizon {
  return { shortTerm: "", mediumTerm: "", longTerm: "" };
}

function normalizeHorizon(
  input: Partial<GoalHorizon> | undefined,
  base: GoalHorizon,
): GoalHorizon {
  return {
    shortTerm: mergeStr(input?.shortTerm, base.shortTerm),
    mediumTerm: mergeStr(input?.mediumTerm, base.mediumTerm),
    longTerm: mergeStr(input?.longTerm, base.longTerm),
  };
}

function normalizeDomainRow(
  input: unknown,
  base: GoalDomainRow,
): GoalDomainRow {
  if (!input || typeof input !== "object") return { ...base, goals: { ...base.goals } };
  const r = input as Partial<GoalDomainRow>;
  return {
    domainLabel: mergeStr(r.domainLabel, base.domainLabel),
    goals: normalizeHorizon(
      r.goals as Partial<GoalHorizon> | undefined,
      base.goals,
    ),
  };
}

function normalizeGroups(
  input: unknown,
  base: GoalNeedGroup[],
): GoalNeedGroup[] {
  if (!Array.isArray(input)) {
    return base.map((g) => ({
      needLabel: g.needLabel,
      domains: g.domains.map((d) => ({ ...d, goals: { ...d.goals } })),
    }));
  }

  return base.map((baseGroup, gi) => {
    const inGroup = input[gi];
    if (!inGroup || typeof inGroup !== "object") {
      return {
        needLabel: baseGroup.needLabel,
        domains: baseGroup.domains.map((d) => ({ ...d, goals: { ...d.goals } })),
      };
    }
    const g = inGroup as Partial<GoalNeedGroup>;
    const inDomains = Array.isArray(g.domains) ? g.domains : [];
    return {
      needLabel: mergeStr(g.needLabel, baseGroup.needLabel),
      domains: baseGroup.domains.map((baseDomain, di) =>
        normalizeDomainRow(inDomains[di], baseDomain),
      ),
    };
  });
}

type LegacyGoalDomain = {
  label: string;
  goals: GoalHorizon;
};

type LegacyGoalSetting = {
  priorityGoal?: string;
  domains?: LegacyGoalDomain[];
};

const LEGACY_DOMAIN_TO_PATH: [string, number, number][] = [
  ["\u4ed5\u4e8b", 2, 0],
  ["\u5bb6\u65cf", 1, 1],
  ["\u304a\u91d1", 3, 0],
  ["\u8cc7\u7523", 3, 0],
  ["\u5065\u5eb7", 0, 0],
  ["\u6559\u990a", 4, 0],
  ["\u6210\u9577", 2, 1],
  ["\u793e\u4f1a", 1, 0],
  ["\u4eba\u9593", 1, 0],
  ["\u7cbe\u795e", 4, 0],
];

function migrateLegacyDomains(
  legacy: LegacyGoalDomain[],
  base: GoalSetting,
): GoalSetting {
  const groups = base.groups.map((g) => ({
    needLabel: g.needLabel,
    domains: g.domains.map((d) => ({
      domainLabel: d.domainLabel,
      goals: { ...d.goals },
    })),
  }));

  for (const row of legacy) {
    const label = row.label ?? "";
    const match = LEGACY_DOMAIN_TO_PATH.find(([key]) => label.includes(key));
    if (!match) continue;
    const [, gi, di] = match;
    const target = groups[gi]?.domains[di];
    if (!target) continue;
    target.goals = normalizeHorizon(row.goals, target.goals);
  }

  return {
    ...base,
    groups,
    roleGoals: base.roleGoals,
    thinkingExpansion: base.thinkingExpansion,
  };
}

function cloneDefault(): GoalSetting {
  const base = DEFAULT_GOAL_SETTING;
  return {
    ownerName: base.ownerName,
    createdDate: base.createdDate,
    lifePhilosophy: base.lifePhilosophy,
    lifeVision: base.lifeVision,
    groups: base.groups.map((g) => ({
      needLabel: g.needLabel,
      domains: g.domains.map((d) => ({
        domainLabel: d.domainLabel,
        goals: { ...d.goals },
      })),
    })),
    roleGoals: normalizeRoleGoalRows(base.roleGoals),
    thinkingExpansion: normalizeThinkingExpansionSheet(base.thinkingExpansion),
  };
}

function createEmptyGoalSetting(): GoalSetting {
  const base = cloneDefault();
  return {
    ownerName: "",
    createdDate: "",
    lifePhilosophy: "",
    lifeVision: "",
    groups: base.groups.map((g) => ({
      needLabel: g.needLabel,
      domains: g.domains.map((d) => ({
        domainLabel: d.domainLabel,
        goals: { shortTerm: "", mediumTerm: "", longTerm: "" },
      })),
    })),
    roleGoals: normalizeRoleGoalRows(undefined),
    thinkingExpansion: normalizeThinkingExpansionSheet(undefined),
  };
}

export function normalizeGoalSetting(
  input?: Partial<GoalSetting> | null,
): GoalSetting {
  const base = createEmptyGoalSetting();
  if (!input) return base;

  const legacy = input as Partial<GoalSetting> & LegacyGoalSetting;
  if (legacy.domains && !input.groups) {
    const migrated = migrateLegacyDomains(
      legacy.domains as LegacyGoalDomain[],
      base,
    );
    if (legacy.priorityGoal?.trim()) {
      migrated.lifeVision = legacy.priorityGoal.trim();
    }
    return migrated;
  }

  return {
    ownerName: mergeStr(input.ownerName, base.ownerName),
    createdDate: mergeStr(input.createdDate, base.createdDate),
    lifePhilosophy: mergeStr(input.lifePhilosophy, base.lifePhilosophy),
    lifeVision: mergeStr(input.lifeVision, base.lifeVision),
    groups: normalizeGroups(input.groups, base.groups),
    roleGoals: normalizeRoleGoalRows(input.roleGoals ?? base.roleGoals),
    thinkingExpansion: normalizeThinkingExpansionSheet(
      input.thinkingExpansion ?? base.thinkingExpansion,
    ),
  };
}

export function goalSettingBarExcerpt(
  gs: GoalSetting,
  linked?: { philosophy?: string; vision?: string },
): string {
  const vision = (linked?.vision ?? gs.lifeVision).trim();
  if (vision) return vision;
  const philosophy = (linked?.philosophy ?? gs.lifePhilosophy).trim();
  if (philosophy) return philosophy;
  for (const g of gs.groups) {
    for (const d of g.domains) {
      const s = d.goals.shortTerm.trim();
      if (s) return s;
    }
  }
  return "";
}

export function applyGoalSettingDefaults(data: AppData): AppData {
  return {
    ...data,
    goalSetting: normalizeGoalSetting(data.goalSetting ?? cloneDefault()),
  };
}
