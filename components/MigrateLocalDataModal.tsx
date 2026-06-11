"use client";

import { Modal } from "@/components/Modal";

type MigrateLocalDataModalProps = {
  onMigrate: () => void;
  onSkip: () => void;
  busy: boolean;
};

export function MigrateLocalDataModal({
  onMigrate,
  onSkip,
  busy,
}: MigrateLocalDataModalProps) {
  return (
    <Modal title="この端末のデータをクラウドに移行" onClose={onSkip}>
      <div className="flex flex-col gap-4 text-sm text-black">
        <p className="leading-relaxed text-black/85">
          ブラウザに保存されていたデータ（localStorage）が見つかりました。Neon
          データベースへ移行しますか？
        </p>
        <p className="text-[11px] leading-relaxed text-black/60">
          移行後はクラウドが正本になり、この端末の localStorage
          は削除されます。
        </p>
        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            移行せず新規開始
          </button>
          <button
            type="button"
            onClick={onMigrate}
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? "移行中…" : "クラウドに移行する"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
