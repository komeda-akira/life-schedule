import fs from "node:fs";

const path = "components/CalendarPanes.tsx";
let c = fs.readFileSync(path, "utf8");

c = c.replace(
  `const PANE_HINTS = {
  year: "2026?????????????",
  month: "?????????????????",
  week: "?????????????????",
  day: "????????????????????",
} as const;`,
  `const PANE_HINTS = {
  year: "2026年から。下へ行くほど未来。",
  month: "年間の重点テーマや取り組みを整理します。",
  week: "週次の重点タスクや進捗を確認します。",
  day: "今日のタスクをシンプルに管理します。",
} as const;`,
);

const pairs = [
  ['title="??????????" hint={PANE_HINTS.year}', 'title="中長期、年間行動計画" hint={PANE_HINTS.year}'],
  ["title={`${year}??????????`}", "title={`${year}年のスコープコメント`}"],
  ["                        ??\n                      </span>", "                        起点\n                      </span>"],
  ['<PaneHeader title="?" hint={PANE_HINTS.month}', '<PaneHeader title="月" hint={PANE_HINTS.month}'],
  ['label="??" onClick={() => onAddYear(-1)}', 'label="前年" onClick={() => onAddYear(-1)}'],
  ['label="??" onClick={() => onAddYear(1)}', 'label="翌年" onClick={() => onAddYear(1)}'],
  ['title="????????????"', 'title="この月のスコープコメント"'],
  ["{i + 1}?", "{i + 1}月"],
  ['<PaneHeader title="?" hint={PANE_HINTS.week}', '<PaneHeader title="週" hint={PANE_HINTS.week}'],
  ['label="??" onClick={() => onAddWeek(-1)}', 'label="前週" onClick={() => onAddWeek(-1)}'],
  ['label="??" onClick={() => onAddWeek(1)}', 'label="翌週" onClick={() => onAddWeek(1)}'],
  ['<PaneHeader title="?" hint={PANE_HINTS.day}', '<PaneHeader title="日" hint={PANE_HINTS.day}'],
  ['label="??" onClick={() => onAddDay(-1)}', 'label="前日" onClick={() => onAddDay(-1)}'],
  ['label="??" onClick={() => onAddDay(1)}', 'label="翌日" onClick={() => onAddDay(1)}'],
  [">??\n          </motion.div>", ">終日\n          </motion.div>"],
  [">??\n          </div>", ">終日\n          </div>"],
  ['<span className="text-black/50">????????????</span>', '<span className="text-black/50">クリックで終日予定を追加</span>'],
  ['aria-label="??????????????????"', 'aria-label="タイムラインをクリックして予定を追加"'],
  ['const tabs = ["?", "?", "?", "?"]', 'const tabs = ["年", "月", "週", "日"]'],
  [
    "heading: `${cursor.getFullYear()}?${cursor.getMonth() + 1}?`,",
    "heading: `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`,",
  ],
  ["heading: `${year}?`,", "heading: `${year}年`,"],
];

for (const [a, b] of pairs) {
  if (a === 'title="????????????"') {
    const i = c.indexOf("PANE_HINTS.week");
    const j = c.indexOf(a, i);
    if (j !== -1) {
      c = c.slice(0, j) + 'title="この週のスコープコメント"' + c.slice(j + a.length);
    }
    continue;
  }
  c = c.split(a).join(b);
}

c = c.replaceAll("<motion.div", "<div");
c = c.replaceAll("</motion.div>", "</motion.div>");

fs.writeFileSync(path, "\uFEFF" + c.replace(/^\uFEFF/, ""), "utf8");
console.log("ok");
