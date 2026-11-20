import type { Directory } from "#types/Directory";

export interface Alias {
  readonly key: string;
  readonly target: string;
  readonly source: string;
  readonly path?: Directory;
}
