"use client";

import { useCallback } from "react";
import { AiAssistantPanel } from "@/components/AiAssistantPanel";
import { DataMenu } from "@/components/DataMenu";
import { EventSearchPanel } from "@/components/EventSearchPanel";
import { useAppData } from "@/components/AppDataProvider";
import { useCalendarNavigation } from "@/components/CalendarNavigation";
import { buildAiContext } from "@/lib/ai-context";

export function AppHeaderTools() {
  const { data } = useAppData();
  const { jumpToDate } = useCalendarNavigation();

  const buildContext = useCallback(() => buildAiContext(data), [data]);

  const onJumpToDate = useCallback(
    (dateKey: string) => {
      jumpToDate(dateKey);
    },
    [jumpToDate],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DataMenu />
      <EventSearchPanel onJumpToDate={onJumpToDate} />
      <AiAssistantPanel buildContext={buildContext} />
    </div>
  );
}
