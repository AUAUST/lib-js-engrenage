import type { File } from "#types/File";

/** @experimental */
export interface BarrelExport {
  readonly file: File;
  readonly binding?: string;
  readonly name?: string;
  readonly typeOnly?: boolean;
}
