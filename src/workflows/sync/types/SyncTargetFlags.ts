import type { SyncFlags } from "#project/sync/index";

export type SyncTargetFlags = Readonly<Partial<Record<string, SyncFlags>>>;
