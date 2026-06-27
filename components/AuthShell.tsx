"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { isLocalDevMode } from "@/lib/auth-config";

function authErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "AccessDenied":
      return "この Google アカウントはログインできません。管理者が ALLOWED_EMAIL にメールを登録している場合は、そのアドレスでログインしてください。";
    case "Configuration":
      return "認証の設定が不足しています。.env.local の AUTH_SECRET・Google OAuth・ALLOWED_EMAIL を確認し、開発サーバーを再起動してください。";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google OAuth の設定を確認してください。AUTH_GOOGLE_ID / AUTH_GOOGLE_CLIENT_SECRET と、リダイレクト URI（http://localhost:3000/api/auth/callback/google）が正しいか見直してください。";
    default:
      return `ログインに失敗しました（${code}）。.env.local の設定を確認してください。`;
  }
}

function LoadingScreen() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
      <p className="text-sm text-black/60">読み込み中…</p>
    </div>
  );
}

function LoginScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    setErrorMessage(authErrorMessage(code));
  }, []);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-bold text-black">
          人生のカレンダー
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-black/70">
          データは Neon データベースに保存されます。Google
          アカウントでログインすると、あなた専用のデータがクラウドに同期されます。
        </p>
        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void signIn("google")}
          className="mt-6 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-zinc-50"
        >
          Google でログイン
        </button>
        <p className="mt-4 text-center text-[11px] text-black/50">
          Google アカウントをお持ちの方なら誰でも利用できます（管理者がメール制限を設定している場合を除く）。
        </p>
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (isLocalDevMode) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

export function UserSessionBar() {
  const { data: session } = useSession();

  if (isLocalDevMode) {
    return null;
  }

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[12rem] truncate text-xs text-black/60 sm:inline">
        {session.user.email}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-50"
      >
        ログアウト
      </button>
    </div>
  );
}
