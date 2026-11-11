import type { syncStages } from "#project/sync/constants";

export type SyncStage = (typeof syncStages)[number];
