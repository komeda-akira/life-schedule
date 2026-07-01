import {
  TES_BLOCK_ORIGINS,
  TES_CENTER_BLOCK,
  TES_GRID_SIZE,
  TES_THEME_LOCAL_COORDS,
  TES_THEME_TO_OUTER_BLOCK,
  TES_VISION_COL,
  TES_VISION_ROW,
} from "@/lib/thinking-expansion-sheet-content";

export type ThinkingExpansionGrid = string[][];

export function createEmptyExpansionGrid(): ThinkingExpansionGrid {
  return Array.from({ length: TES_GRID_SIZE }, () =>
    Array.from({ length: TES_GRID_SIZE }, () => ""),
  );
}

function mergeCell(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeExpansionGrid(input: unknown): ThinkingExpansionGrid {
  const empty = createEmptyExpansionGrid();
  if (!Array.isArray(input)) return empty;

  return empty.map((row, r) =>
    row.map((_, c) => {
      const inRow = input[r];
      if (!Array.isArray(inRow)) return "";
      return mergeCell(inRow[c]);
    }),
  );
}

export function getBlockIndex(row: number, col: number): number | null {
  if (row < 0 || col < 0 || row >= TES_GRID_SIZE || col >= TES_GRID_SIZE) {
    return null;
  }
  const blockRow = Math.floor(row / 3);
  const blockCol = Math.floor(col / 3);
  return blockRow * 3 + blockCol;
}

export function isVisionCell(row: number, col: number): boolean {
  return row === TES_VISION_ROW && col === TES_VISION_COL;
}

export function isThemeAnchorCell(row: number, col: number): number | null {
  if (getBlockIndex(row, col) !== TES_CENTER_BLOCK) return null;
  if (isVisionCell(row, col)) return null;

  const localR = row - TES_BLOCK_ORIGINS[TES_CENTER_BLOCK][0];
  const localC = col - TES_BLOCK_ORIGINS[TES_CENTER_BLOCK][1];
  const index = TES_THEME_LOCAL_COORDS.findIndex(
    ([lr, lc]) => lr === localR && lc === localC,
  );
  return index >= 0 ? index : null;
}

export function isOuterBlockCenter(row: number, col: number): number | null {
  const block = getBlockIndex(row, col);
  if (block == null || block === TES_CENTER_BLOCK) return null;

  const [originR, originC] = TES_BLOCK_ORIGINS[block];
  if (row === originR + 1 && col === originC + 1) {
    const themeIndex = TES_THEME_TO_OUTER_BLOCK.indexOf(
      block as (typeof TES_THEME_TO_OUTER_BLOCK)[number],
    );
    return themeIndex >= 0 ? themeIndex : null;
  }
  return null;
}

export function themeAnchorGlobal(themeIndex: number): [number, number] {
  const [lr, lc] = TES_THEME_LOCAL_COORDS[themeIndex];
  const [originR, originC] = TES_BLOCK_ORIGINS[TES_CENTER_BLOCK];
  return [originR + lr, originC + lc];
}

export function outerCenterGlobal(themeIndex: number): [number, number] {
  const block = TES_THEME_TO_OUTER_BLOCK[themeIndex];
  const [originR, originC] = TES_BLOCK_ORIGINS[block];
  return [originR + 1, originC + 1];
}

/** セル更新（テーマ⇔外側ブロック中心の双方向同期） */
export function setExpansionCell(
  grid: ThinkingExpansionGrid,
  row: number,
  col: number,
  value: string,
): ThinkingExpansionGrid {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;

  const themeFromCenter = isThemeAnchorCell(row, col);
  if (themeFromCenter != null) {
    const [or, oc] = outerCenterGlobal(themeFromCenter);
    next[or][oc] = value;
    return next;
  }

  const themeFromOuter = isOuterBlockCenter(row, col);
  if (themeFromOuter != null) {
    const [tr, tc] = themeAnchorGlobal(themeFromOuter);
    next[tr][tc] = value;
    return next;
  }

  return next;
}

export function cellRole(
  row: number,
  col: number,
): "vision" | "theme" | "outer-center" | "detail" {
  if (isVisionCell(row, col)) return "vision";
  if (isThemeAnchorCell(row, col) != null) return "theme";
  if (isOuterBlockCenter(row, col) != null) return "outer-center";
  return "detail";
}

export type ThinkingExpansionSheet = {
  cells: ThinkingExpansionGrid;
};

export function createEmptyThinkingExpansionSheet(): ThinkingExpansionSheet {
  return { cells: createEmptyExpansionGrid() };
}

export function normalizeThinkingExpansionSheet(
  input?: Partial<ThinkingExpansionSheet> | null,
): ThinkingExpansionSheet {
  if (!input) return createEmptyThinkingExpansionSheet();
  return { cells: normalizeExpansionGrid(input.cells) };
}

/** 記入例グリッド（参考表示用・保存しない） */
export function createExampleExpansionGrid(): ThinkingExpansionGrid {
  const grid = createEmptyExpansionGrid();

  grid[4][4] = "会社＆業界トップ\nリーダーとして縁ある人を幸せにする";

  const themes = [
    "健全な財務体質",
    "100歳まで健康",
    "信頼し合える友・仲間",
    "温かい家庭",
    "能力開発",
    "趣味・教養",
    "蓄財・経済",
    "地域貢献",
  ];

  themes.forEach((theme, index) => {
    const [tr, tc] = themeAnchorGlobal(index);
    const [or, oc] = outerCenterGlobal(index);
    grid[tr][tc] = theme;
    grid[or][oc] = theme;
  });

  const healthSamples: [number, number, string][] = [
    [0, 4, "健康の知識"],
    [0, 5, "身体年齢30代"],
    [1, 3, "筋力・スタミナ"],
    [1, 5, "80歳で20本の歯"],
    [2, 3, "一流の見た目"],
    [2, 4, "適正体重"],
    [2, 5, "質の高い睡眠"],
  ];
  for (const [r, c, text] of healthSamples) {
    grid[r][c] = text;
  }

  return grid;
}
