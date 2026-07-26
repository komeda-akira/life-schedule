/** Google カレンダー風タイムライン操作の共通ロジック */

import {
  computeManipulatedRange,
  floorSnapMinutes,
  normalizeCreateRange,
  snapTimelineMinutes,
  TIMELINE_DAY_END_MIN,
  TIMELINE_DEFAULT_DURATION_MIN,
  TIMELINE_SNAP_MINUTES,
  type EventManipMode,
} from "@/lib/day-schedule";

export const TIMELINE_DRAG_THRESHOLD_PX = 5;
export const TIMELINE_RESIZE_HANDLE_PX = 10;
export const TIMELINE_AUTOSCROLL_EDGE_PX = 40;
export const TIMELINE_AUTOSCROLL_SPEED_PX = 14;

export type TimelineCreateDrag = {
  pointerId: number;
  /** ドラッグ開始スロット（floor snap） */
  originMin: number;
  /** 現在のポインタ位置（分） */
  currentMin: number;
  pointerStartClientY: number;
};

export type TimelineEventDrag = {
  mode: EventManipMode;
  pointerId: number;
  eventId: string;
  originStartMin: number;
  originEndMin: number;
  grabOffsetMin: number;
  pointerStartClientY: number;
  currentStartMin: number;
  currentEndMin: number;
};

export type TimelineRange = { startMin: number; endMin: number };

/** クリック位置を含むスロット開始（Google: floor） */
export function pointerMinutesFloor(
  clientY: number,
  gridTop: number,
  gridHeight: number,
  hourPx: number,
  startHour = 0,
): number {
  const y = Math.min(gridHeight, Math.max(0, clientY - gridTop));
  return floorSnapMinutes(startHour * 60 + (y / hourPx) * 60);
}

/** 移動・リサイズ用（round snap） */
export function pointerMinutesRound(
  clientY: number,
  gridTop: number,
  gridHeight: number,
  hourPx: number,
  startHour = 0,
): number {
  const y = Math.min(gridHeight, Math.max(0, clientY - gridTop));
  return snapTimelineMinutes(startHour * 60 + (y / hourPx) * 60);
}

/** 作成ドラッグ中の表示レンジ（未移動なら既定1時間） */
export function createDragPreviewRange(drag: TimelineCreateDrag): TimelineRange {
  const moved =
    Math.abs(drag.currentMin - drag.originMin) >= TIMELINE_SNAP_MINUTES;
  if (!moved) {
    const startMin = drag.originMin;
    const endMin = Math.min(
      TIMELINE_DAY_END_MIN,
      startMin + TIMELINE_DEFAULT_DURATION_MIN,
    );
    if (endMin <= startMin) {
      return normalizeCreateRange(
        Math.max(0, TIMELINE_DAY_END_MIN - TIMELINE_DEFAULT_DURATION_MIN),
        TIMELINE_DAY_END_MIN,
      );
    }
    return { startMin, endMin };
  }
  return normalizeCreateRange(drag.originMin, drag.currentMin);
}

export function finishCreateDragRange(drag: TimelineCreateDrag): TimelineRange {
  return createDragPreviewRange(drag);
}

export function updateEventDragFromPointer(
  drag: TimelineEventDrag,
  pointerMin: number,
): TimelineEventDrag {
  const range = computeManipulatedRange(
    drag.mode,
    pointerMin,
    drag.originStartMin,
    drag.originEndMin,
    drag.grabOffsetMin,
  );
  return {
    ...drag,
    currentStartMin: range.startMin,
    currentEndMin: range.endMin,
  };
}

export function detectResizeOrMove(
  localY: number,
  blockHeight: number,
): EventManipMode {
  const handle = Math.min(
    TIMELINE_RESIZE_HANDLE_PX,
    Math.max(6, Math.floor(blockHeight / 5)),
  );
  if (localY <= handle) return "resize-start";
  if (localY >= blockHeight - handle) return "resize-end";
  return "move";
}

/** スクロール容器端での自動スクロール（Googleカレンダー同様） */
export function autoScrollNearEdge(
  scrollEl: HTMLElement,
  clientY: number,
): void {
  const rect = scrollEl.getBoundingClientRect();
  if (clientY < rect.top + TIMELINE_AUTOSCROLL_EDGE_PX) {
    scrollEl.scrollTop -= TIMELINE_AUTOSCROLL_SPEED_PX;
  } else if (clientY > rect.bottom - TIMELINE_AUTOSCROLL_EDGE_PX) {
    scrollEl.scrollTop += TIMELINE_AUTOSCROLL_SPEED_PX;
  }
}

export function scrollTimelineToMinutes(
  scrollEl: HTMLElement,
  minutes: number,
  hourPx: number,
  startHour = 0,
): void {
  const y = ((minutes - startHour * 60) / 60) * hourPx;
  scrollEl.scrollTop = Math.max(0, y - scrollEl.clientHeight / 3);
}
