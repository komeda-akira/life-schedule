# チャット履歴メモ（2026-05-14 時点）

Cursor 上の会話で扱った内容の要約と、生成・更新したファイル・URLの一覧です。  
**全文ログではなく**、あとから辿れるための索引として保存しています。

---

## 1. 時系列サマリー

1. **過去チャットの場所** — `SKILL.md` 自体は会話ログではないことの説明。エージェント用トランスクリプトは `.cursor/projects/.../agent-transcripts/*.jsonl`、以前の grill 関連は `AI-news` プロジェクト配下などに存在する旨を案内。
2. **開発サーバー** — `C:\Users\komeda\src\workspace-ui-kit` で `npm run dev`（Next.js、http://localhost:3000）。`AI-news` は `dev` スクリプトなし（CLI のみ）。
3. **人生スケジュール（グリル）** — 実行カレンダー中心、四ペイン、単一カーソル、ローカル正本＋JSON、月曜週、重なり表示、日ペイン、モーダル、タイトル必須、検索、新規 Next アプリ、Next App Router、日付ライブラリは未決、などを **1問ずつ** 合意。
4. **設計メモ** — `design-spec-2026-05-14.md` に集約。
5. **UI 画像** — ワイヤー PNG を `docs` に保存（後から 4 ボタン＋スコープモーダル版を追加）。
6. **北極星の拡張** — プライムシート、年・月・週のコメントと数字クリック詳細を設計メモに追記。
7. **Mermaid 図解** — `overview-diagram.md` にフロー図を保存。
8. **図解 HTML + Surge** — `creating-visual-explainers` スキルに従い HTML を生成し公開。

---

## 2. 合意済み設計の正本

| 内容 | パス |
|------|------|
| 設計仕様（表・未決・PNG 一覧） | `C:\Users\komeda\src\life-schedule\docs\design-spec-2026-05-14.md` |
| Mermaid 図（チャット＋UI の関係） | `C:\Users\komeda\src\life-schedule\docs\overview-diagram.md` |
| 本履歴 | `C:\Users\komeda\src\life-schedule\docs\conversation-history-2026-05-14.md` |

---

## 3. ワイヤー画像（PNG）

| ファイル | 説明 |
|----------|------|
| `life-schedule-ui-wireframe.png` | 四ペイン＋終日／タイムライン基本形 |
| `life-schedule-ui-north-star-modal.png` | 旧：北極星3ボタン＋モーダル |
| `life-schedule-ui-north-star-4btns-scope-modal.png` | 4ボタン＋スコープコメント用モーダルのラフ |

**ディレクトリ:** `C:\Users\komeda\src\life-schedule\docs\`

---

## 4. 図解 HTML（Surge）

| 項目 | 値 |
|------|-----|
| 公開 URL | https://diagram-life-schedule-tool.surge.sh（**index.html と同一フォルダに PNG を同梱**し、図解末尾で表示） |
| ソース HTML | `C:\Users\komeda\src\creating-visual-explainers\output\life-schedule-tool.html` |
| デプロイ用フォルダ | `C:\Users\komeda\src\creating-visual-explainers\output\life-schedule-tool-surge\`（`index.html` + `robots.txt`） |
| デプロイ履歴ログ | `C:\Users\komeda\src\creating-visual-explainers\deploy-history.log` |

削除する場合の例: `npx surge teardown diagram-life-schedule-tool.surge.sh`

---

## 5. 参照したスキル・パス

| 名前 | パス |
|------|------|
| grill-me | `C:\Users\komeda\.claude\skills\grill-me\SKILL.md` |
| creating-visual-explainers | `C:\Users\komeda\src\creating-visual-explainers\.claude\skills\creating-visual-explainers\SKILL.md` |

---

## 6. Cursor チャット全文について

チャット画面そのもののエクスポートは、**Cursor 側の機能**で行う必要があります。  
エージェント用の生ログは、プロジェクトごとに `agent-transcripts` 配下の `.jsonl` に残る場合があります（フォルダ名はワークスペースにより異なる）。

---

## 7. 次にやるとよいこと（会話で出た候補）

- `create-next-app` で `life-schedule`（または別名）の Next プロジェクトを初期化する。
- 予定・北極星・スコープコメントの **JSON スキーマ**を固定する。
- 週キー（ISO 週 vs 表示範囲）と、行クリック／数字クリックの **ヒット領域**を決める。
