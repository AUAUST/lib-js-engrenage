import type { File } from "#types/File";

export interface FragmentConditions {
  extensions: ReadonlySet<string>;
  exists(file: File): Promise<boolean>;
}
