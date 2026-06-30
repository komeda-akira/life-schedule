/** データの保存先モード */
export type StorageBackend = "cloud" | "local-plain" | "local-vault";

/**
 * cloud … Neon + Google ログイン（従来の本番モード）
 * local-plain … 開発用。パスワードなしで localStorage に平文保存
 * local-vault … 既定。各利用者の PC 上にパスワード暗号化して保存
 */
export function getStorageBackend(): StorageBackend {
  if (process.env.NEXT_PUBLIC_STORAGE_MODE === "cloud") {
    return "cloud";
  }
  if (
    process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" &&
    process.env.NODE_ENV === "development"
  ) {
    return "local-plain";
  }
  return "local-vault";
}

export function isCloudStorageMode(): boolean {
  return getStorageBackend() === "cloud";
}

export function isLocalPlainStorageMode(): boolean {
  return getStorageBackend() === "local-plain";
}

export function isLocalVaultStorageMode(): boolean {
  return getStorageBackend() === "local-vault";
}

/** 開発用 local-plain のみ（本番 local-vault ではサーバー API を無認証にしない） */
export function isLocalFirstMode(): boolean {
  return getStorageBackend() === "local-plain";
}
