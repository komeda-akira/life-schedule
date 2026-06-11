import { getSql } from "@/lib/db";
import { normalizeAppData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

type AppDataRow = {
  payload: unknown;
};

export async function fetchAppDataRow(
  userId: string,
): Promise<AppData | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT payload
    FROM app_data
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as AppDataRow | undefined;
  if (!row?.payload) return null;
  return normalizeAppData(row.payload as Partial<AppData>);
}

export async function saveAppDataRow(
  userId: string,
  data: AppData,
): Promise<void> {
  const sql = getSql();
  const payload = JSON.stringify(normalizeAppData(data));
  await sql`
    INSERT INTO app_data (user_id, payload, updated_at)
    VALUES (${userId}, ${payload}::jsonb, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = NOW()
  `;
}

export async function hasAppDataRow(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 AS ok
    FROM app_data
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  return rows.length > 0;
}
