type OpenLayerArrowProps = {
  className?: string;
};

/** 下位レイヤー（シート・モーダル）を開くボタン用の右矢印 */
export function OpenLayerArrow({ className = "" }: OpenLayerArrowProps) {
  return (
    <span
      className={`inline-block shrink-0 leading-none text-black/45 ${className}`}
      aria-hidden
    >
      →
    </span>
  );
}

type SheetOpenActionButtonProps = {
  onClick: () => void;
  title: string;
  subtitle?: string;
  className?: string;
};

export function SheetOpenActionButton({
  onClick,
  title,
  subtitle,
  className = "",
}: SheetOpenActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-2 py-2 text-left text-xs text-black hover:bg-zinc-100 ${className}`}
    >
      <span className="min-w-0">
        <span className="font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-[10px] text-black/55">{subtitle}</span>
        ) : null}
      </span>
      <OpenLayerArrow className="mt-0.5" />
    </button>
  );
}
