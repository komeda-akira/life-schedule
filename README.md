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

### データ保存（既定: 各利用者の PC 上）

**Neon は不要**です。各利用者が初回にパスワードを作成し、データは **その PC のブラウザ内** に暗号化して保存されます。

| 項目 | 内容 |
|------|------|
| 保存先 | ブラウザ `localStorage`（暗号化） |
| 認証 | 利用者が作成したパスワード |
| 自動保存 | 編集後 約 800ms で暗号化保存 |
| バックアップ | ヘッダーの「JSONを書き出す／読み込む」 |
| 別 PC | 自動同期なし（JSON 書き出しで移行） |

開発中だけパスワードを省略する場合（`.env.local`）:

```env
AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_BYPASS=true
```

### Vercel に公開（講義課題）

1. GitHub に push（例: `komeda-akira/life-schedule`）
2. [Vercel](https://vercel.com/) でリポジトリを Import → Deploy
3. 環境変数（**最小構成**）:

```env
NEXT_PUBLIC_STORAGE_MODE=local
GEMINI_API_KEY=...   # AI 機能を使う場合のみ
```

4. デプロイ後、利用者は URL を開く → パスワード作成 → 利用開始

**課題のポイント:** リロードしてもデータが残る（同一ブラウザ内）。DB は使わず、各 PC ローカルに保存。

記憶の設計図解: https://diagram-life-calendar-memory.surge.sh/

### クラウド保存（オプション: Neon + Google）

従来のクラウド同期が必要な場合のみ:

```env
NEXT_PUBLIC_STORAGE_MODE=cloud
```

1. [Neon](https://neon.tech/) で PostgreSQL を作成し、`scripts/init-db.sql` を SQL エディタで実行
2. Google OAuth・`DATABASE_URL`・`AUTH_SECRET` を設定
3. Google ログイン → 初回のみ localStorage からの移行を選択可能

## 構成（現状）

- 北極星バー — 理念・目的・ビジョン・目標・プライムシート＋自分100年史・やりたいこと100
- 各ワークシート — 手書き相当の初期値付き編集画面（**PC 内に自動保存**）
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
| `GEMINI_MODEL` | 任意（既定 `gemini-2.5-flash`） |
| `ALLOW_ANY_GOOGLE_USER` | `true` で全 Google ユーザー許可 |
