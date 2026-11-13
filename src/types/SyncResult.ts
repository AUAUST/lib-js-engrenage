import type { File } from "#types/File";
import type { SyncStatus } from "#types/SyncStatus";

/**
 * A file a sync changed, or would change, with what happened to it.
 */
export interface SyncResult {
  file: File;
  status: SyncStatus;
}
