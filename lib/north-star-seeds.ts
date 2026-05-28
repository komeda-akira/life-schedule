import type { AppData, NorthStarCategory, NorthStarItem } from "@/lib/types";

/**
 * \u30ef\u30a4\u30e4\u30fc life-schedule-screenshot-4btn-scope-comment.png
 * \u5317\u6975\u661f\u30dc\u30bf\u30f3 \u2194 \u5404\u30da\u30a4\u30f3\u306e\u8aac\u660e\u6587
 */
export const NORTH_STAR_SCREENSHOT_DEFAULTS: Record<NorthStarCategory, string> =
  {
    vision: "\u5229\u4ed6\uff08\u6210\u529f\u306e\u571f\u53f0\uff09",
    purpose:
      "\u5e74\u9593\u306e\u91cd\u70b9\u30c6\u30fc\u30de\u3084\u53d6\u308a\u7d44\u307f\u3092\u6574\u7406\u3057\u307e\u3059\u3002",
    goal: "\u9031\u6b21\u306e\u91cd\u70b9\u30bf\u30b9\u30af\u3084\u9032\u6357\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002",
    prime:
      "\u4eca\u65e5\u306e\u30bf\u30b9\u30af\u3092\u30b7\u30f3\u30d7\u30eb\u306b\u7ba1\u7406\u3057\u307e\u3059\u3002",
  };

export function defaultNorthStarTitle(
  category: NorthStarCategory,
): string {
  return NORTH_STAR_SCREENSHOT_DEFAULTS[category];
}

function hasValidNorthStar(
  items: NorthStarItem[],
  category: NorthStarCategory,
): boolean {
  return items.some(
    (n) => n.category === category && n.title.trim().length > 0,
  );
}

function createSeedItem(category: NorthStarCategory): NorthStarItem {
  return {
    id: `seed-${category}-screenshot`,
    category,
    title: NORTH_STAR_SCREENSHOT_DEFAULTS[category],
    createdAt: new Date().toISOString(),
  };
}

/** \u30b9\u30af\u30b7\u30e7\u306e\u6587\u8a00\u3092\u5317\u6975\u661f\u306b\u88dc\u5b8c\uff08\u7a7a\u30fb\u672a\u5165\u529b\u306e\u307f\uff09 */
export function applyNorthStarScreenshotDefaults(data: AppData): AppData {
  let northStar = [...data.northStar];
  let changed = false;

  for (const category of Object.keys(
    NORTH_STAR_SCREENSHOT_DEFAULTS,
  ) as NorthStarCategory[]) {
    if (category === "purpose" || category === "goal") continue;
    if (hasValidNorthStar(northStar, category)) continue;
    northStar = northStar.filter(
      (n) => n.category !== category || n.title.trim().length > 0,
    );
    northStar.push(createSeedItem(category));
    changed = true;
  }

  if (!changed) return data;
  return { ...data, northStar };
}

/** @deprecated use applyNorthStarScreenshotDefaults */
export const DEFAULT_VISION_TITLE = NORTH_STAR_SCREENSHOT_DEFAULTS.vision;

export function withDefaultVisionIfEmpty(data: AppData): AppData {
  return applyNorthStarScreenshotDefaults(data);
}
