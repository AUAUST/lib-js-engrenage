import type { File } from "#types/File";

export interface ResolvedLocation {
  readonly file: File;
  readonly configured: boolean;
}
