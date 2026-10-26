import type { File } from "#types/File";
import type { SyncStatus } from "#types/SyncStatus";

export interface SyncResult {
  file: File;
  status: SyncStatus;
}
