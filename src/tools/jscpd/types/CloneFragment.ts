import type { File } from "#types/File";

export interface CloneFragment {
  readonly file: File;
  readonly start: number;
  readonly end: number;
}
