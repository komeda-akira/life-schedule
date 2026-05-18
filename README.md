# 人生スケジュール管理ツール（MVP）

[画面と操作の図解（公開）](https://diagram-life-schedule-tool.surge.sh/) に沿った **Next.js（App Router）** のアプリです。ローカルの設計一次情報は `docs/design-spec-2026-05-14.md`。

## 起動

```bash
cd life-schedule
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます（`workspace-ui-kit` と同時起動する場合は `npm run dev -- -p 3001` などでポートを変えてください）。

## 構成（現状）

- 北極星バー（理念・目的・目標・プライムシート）— 一覧・新規・編集モーダル
- 年・月・週のスコープコメント — ヘッダー／ラベルから編集
- 日ペイン — 終日行・24hタイムライン、クリックで予定追加、重なりは横並び
- 予定データ — `localStorage` 保存、JSON の書き出し／読み込み（ヘッダー）
- 年・月・週・日の四ペイン — 広い画面は4列、狭い画面はタブ切替
- ヘッダー／フッターから公開図解 URL へリンク
