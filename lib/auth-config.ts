/** 開発時のみ: Google ログインをスキップし localStorage で動作 */
export const isLocalDevMode =
  process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" &&
  process.env.NODE_ENV === "development";
