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

### クラウド保存（講義課題: Neon + Vercel + Google）

1. [Neon](https://neon.tech/) で PostgreSQL を作成し、`scripts/init-db.sql` を SQL エディタで実行
2. `.env.example` を `.env.local` にコピーし、各値を設定
   - `AUTH_SECRET`: `openssl rand -base64 32` などで生成
   - Google Cloud Console で OAuth クライアント（Web）を作成  
     リダイレクト URI: `http://localhost:3000/api/auth/callback/google` と本番 URL
   - `ALLOW_ANY_GOOGLE_USER=true`（誰でも Google ログイン可）または `ALLOWED_EMAIL` で制限
   - `DATABASE_URL`: Neon の接続文字列
3. `npm run dev` → Google ログイン → 初回のみ localStorage からの移行を選択可能
4. Vercel にデプロイし、上記環境変数を Vercel のプロジェクト設定に追加

記憶の設計図解: https://diagram-life-calendar-memory.surge.sh/

## 構成（現状）

- 北極星バー — 理念・目的・ビジョン・目標・プライムシート＋自分100年史・やりたいこと100
- 各ワークシート — 手書き相当の初期値付き編集画面（Neon へ自動保存）
- 年・月・週のスコープコメント — ヘッダー／ラベルから編集
- 日ペイン — 終日行・24hタイムライン（ドラッグ作成・移動・リサイズ）、土曜=青・日曜=赤
- **予定の繰り返し** — 毎日/毎週/毎月/毎年、終了日指定、個別編集・削除
- **予定検索** — ヘッダーの検索欄からタイトル・メモで検索し日付へジャンプ
- **Gemini AI** — ヘッダー「AI に相談」から計画・振り返りを質問（`GEMINI_API_KEY` 要）
- 予定データ — JSON の書き出し／読み込み（ヘッダー）
- 年・月・週・日の四ペイン — 広い画面は4列、狭い画面はタブ切替
- ヘッダーから公開図解（改善・画面）へリンク

### 誰でも使える公開設定

DB はもともと **ユーザー email ごとに1行** のマルチテナント構成です。Google アカウントなら誰でもログインできるようにするには:

```env
ALLOW_ANY_GOOGLE_USER=true
# ALLOWED_EMAIL は未設定または空
```

特定ユーザーのみに制限する場合は `ALLOWED_EMAIL=you@gmail.com` またはカンマ区切りで複数指定します。

### 環境変数（追加）

| 変数 | 用途 |
|------|------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) の API キー |
| `GEMINI_MODEL` | 任意（既定 `gemini-2.0-flash`） |
| `ALLOW_ANY_GOOGLE_USER` | `true` で全 Google ユーザー許可 |
