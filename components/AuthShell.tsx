"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

function LoadingScreen() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
      <p className="text-sm text-black/60">読み込み中…</p>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-bold text-black">
          人生のカレンダー
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-black/70">
          データは Neon データベースに保存されます。続けるには Google
          アカウントでログインしてください。
        </p>
        <button
          type="button"
          onClick={() => void signIn("google")}
          className="mt-6 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-zinc-50"
        >
          Google でログイン
        </button>
        <p className="mt-4 text-center text-[11px] text-black/50">
          許可されたメールアドレスのみログインできます。
        </p>
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  const { status } = useSession();

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
