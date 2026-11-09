import type { SyncFlags } from "#project/sync/ports/SyncFlags";

export type SyncTargetFlags = Readonly<Partial<Record<string, SyncFlags>>>;
