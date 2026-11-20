import type { File } from "#types/File";
import type { SyncStatus } from "#types/SyncStatus";

// @debt a domain contract held as a global type; belongs to the lowest domain owning it
/**
 * A file a sync changed, or would change, with what happened to it.
 */
export interface SyncResult {
  file: File;
  status: SyncStatus;
}
