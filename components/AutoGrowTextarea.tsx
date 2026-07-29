"use client";

import {
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

type AutoGrowTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows"
> & {
  /** 空のときの最小高さ（px） */
  minHeightPx?: number;
};

/** 入力内容に合わせて高さが伸び、再表示時も全文が見える textarea */
export function AutoGrowTextarea({
  value,
  minHeightPx = 128,
  className = "",
  onChange,
  ...rest
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(minHeightPx, el.scrollHeight)}px`;
  }, [value, minHeightPx]);

  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      rows={1}
      onChange={onChange}
      className={`resize-none overflow-hidden ${className}`}
    />
  );
}
