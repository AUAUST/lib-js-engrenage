import type { FileLocation } from "#project/config/types/FileLocation";

export interface LocatedResource {
  readonly name: string;
  readonly owner: string;
  readonly title: string;
  readonly location: FileLocation;
  readonly committed: boolean;
  readonly generated: boolean;
  readonly formatted: boolean;
  readonly linted: boolean;
  readonly appendOnly: boolean;
  readonly diffed: boolean;
  readonly parts: boolean;
}
