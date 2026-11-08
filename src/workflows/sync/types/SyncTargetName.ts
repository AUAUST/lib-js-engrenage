import type { syncTargetFlags } from "#workflows/sync/constants";

export type SyncTargetName = keyof typeof syncTargetFlags;
