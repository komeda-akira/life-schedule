# 人生スケジュール管理ツール（MVP）

[改善の設計図解（公開）](https://diagram-life-schedule-improvements.surge.sh/) と [画面と操作の図解](https://diagram-life-schedule-tool.surge.sh/) に沿った **Next.js（App Router）** のアプリです。

- 改善の設計図解（HTML 同梱）: `docs/design-improvements-diagram.html`
- 設計メモ・Mermaid: `docs/overview-diagram.md`
- 詳細仕様: `docs/design-spec-2026-05-14.md`

## 起動

```bash
cd life-schedule
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます（`workspace-ui-kit` と同時起動する場合は `npm run dev -- -p 3001` などでポートを変えてください）。

## 構成（現状）

- 北極星バー — 理念・目的・ビジョン・目標・プライムシート＋自分100年史・やりたいこと100
- 各ワークシート — 手書き相当の初期値付き編集画面（`localStorage` 自動保存）
- 年・月・週のスコープコメント — ヘッダー／ラベルから編集
- 日ペイン — 終日行・24hタイムライン、土曜=青・日曜=赤
- 予定データ — JSON の書き出し／読み込み（ヘッダー）
- 年・月・週・日の四ペイン — 広い画面は4列、狭い画面はタブ切替
- ヘッダーから公開図解（改善・画面）へリンク
