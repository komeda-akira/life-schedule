-- Neon で実行: 人生カレンダーの実行データ（AppData JSON 1行 / ユーザー）
CREATE TABLE IF NOT EXISTS app_data (
  user_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_data_updated_at_idx ON app_data (updated_at DESC);
