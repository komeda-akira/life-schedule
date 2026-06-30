"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { LocalVaultContextProvider } from "@/components/LocalVaultContext";
import {
  changeVaultPassword,
  hasMigratableLegacyPlainStorage,
  hasVault,
  saveVault,
  setupVault,
  unlockVault,
  wipeVault,
} from "@/lib/local-vault";
import { isLocalVaultStorageMode } from "@/lib/storage-mode";
import type { AppData } from "@/lib/types";

type GatePhase = "checking" | "setup" | "login";

type LocalVaultGateProps = {
  children: ReactNode;
};

function PasswordField({
  label,
  value,
  onChange,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-black/75">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete ?? "current-password"}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

function VaultAuthCard({
  title,
  lead,
  error,
  children,
}: {
  title: string;
  lead: string;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-zinc-100/80 via-zinc-50/40 to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl font-bold text-black">{title}</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-black/70">
          {lead}
        </p>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
            {error}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function LocalVaultGate({ children }: LocalVaultGateProps) {
  const [phase, setPhase] = useState<GatePhase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bootData, setBootData] = useState<AppData | null>(null);
  const passwordRef = useRef("");
  const flushSaveRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!isLocalVaultStorageMode()) return;
    setPhase(hasVault() ? "login" : "setup");
  }, []);

  const registerFlushSave = useCallback((fn: () => Promise<void>) => {
    flushSaveRef.current = fn;
    return () => {
      if (flushSaveRef.current === fn) {
        flushSaveRef.current = null;
      }
    };
  }, []);

  const lock = useCallback(async () => {
    if (flushSaveRef.current) {
      await flushSaveRef.current();
    }
    passwordRef.current = "";
    setPassword("");
    setConfirm("");
    setBootData(null);
    setError(null);
    setPhase(hasVault() ? "login" : "setup");
  }, []);

  const saveEncrypted = useCallback(async (data: AppData) => {
    if (!passwordRef.current) return;
    await saveVault(passwordRef.current, data);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string, data: AppData) => {
      await changeVaultPassword(currentPassword, nextPassword, data);
      passwordRef.current = nextPassword;
    },
    [],
  );

  const finishUnlock = (nextPassword: string, data: AppData) => {
    passwordRef.current = nextPassword;
    setBootData(data);
    setPassword("");
    setConfirm("");
    setError(null);
  };

  const onSetup = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }
    if (password !== confirm) {
      setError("確認用パスワードが一致しません。");
      return;
    }
    setBusy(true);
    try {
      await setupVault(password);
      const data = await unlockVault(password);
      finishUnlock(password, data);
    } catch {
      wipeVault();
      setError("初期設定に失敗しました。もう一度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await unlockVault(password);
      finishUnlock(password, data);
    } catch (e) {
      if (e instanceof Error && e.message === "INVALID_PASSWORD") {
        setError("パスワードが正しくありません。");
      } else {
        setError("データを開けませんでした。パスワードを忘れた場合は下のリンクから再設定してください。");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!isLocalVaultStorageMode()) {
    return <>{children}</>;
  }

  if (phase === "checking") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16">
        <p className="text-sm text-black/60">準備中…</p>
      </div>
    );
  }

  if (!bootData) {
    const legacyHint = hasMigratableLegacyPlainStorage()
      ? "以前のブラウザ保存データがある場合、初回設定時にこのパスワードで暗号化して引き継ぎます。"
      : "データはこのPCのブラウザ内にのみ保存されます。別のPCやブラウザでは共有されません。";

    if (phase === "setup") {
      return (
        <VaultAuthCard
          title="人生カレンダー"
          lead={`初回利用です。個人用のパスワードを作成してください。${legacyHint}`}
          error={error}
        >
          <form className="flex flex-col gap-4" onSubmit={onSetup}>
            <PasswordField
              label="パスワード（8文字以上）"
              value={password}
              onChange={setPassword}
              autoFocus
              autoComplete="new-password"
            />
            <PasswordField
              label="パスワード（確認）"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy ? "設定中…" : "パスワードを作成して始める"}
            </button>
          </form>
        </VaultAuthCard>
      );
    }

    return (
      <VaultAuthCard
        title="人生カレンダー"
        lead="パスワードを入力して、このPCに保存されたデータを開きます。"
        error={error}
      >
        <form className="flex flex-col gap-4" onSubmit={onLogin}>
          <PasswordField
            label="パスワード"
            value={password}
            onChange={setPassword}
            autoFocus
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? "確認中…" : "ログイン"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  "保存データを削除して初回設定からやり直しますか？この操作は取り消せません。",
                )
              ) {
                return;
              }
              wipeVault();
              setPhase("setup");
              setPassword("");
              setConfirm("");
              setError(null);
            }}
            className="text-center text-xs text-black/50 underline-offset-2 hover:text-black/70 hover:underline"
          >
            パスワードを忘れた（データを削除して再設定）
          </button>
        </form>
      </VaultAuthCard>
    );
  }

  return (
    <LocalVaultContextProvider
      bootData={bootData}
      onLock={lock}
      saveEncrypted={saveEncrypted}
      changePassword={changePassword}
      registerFlushSave={registerFlushSave}
    >
      {children}
    </LocalVaultContextProvider>
  );
}
