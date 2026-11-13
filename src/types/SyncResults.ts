import type { SyncResult } from "#types/SyncResult";

/**
 * The files a sync changed, or would change, one result per file.
 */
export type SyncResults = readonly SyncResult[];
