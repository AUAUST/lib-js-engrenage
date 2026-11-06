import type { SyncTargetName } from "#workflows/sync/types/SyncTargetName";

export type SyncTargetFlags = Partial<
  Record<SyncTargetName, Record<string, boolean>>
>;
