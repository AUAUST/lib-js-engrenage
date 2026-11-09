import type { FileLocation } from "#project/config/types/FileLocation";

export interface LocatedResource {
  readonly name: string;
  readonly owner: string;
  readonly title: string;
  readonly location: FileLocation;
  readonly committed: boolean;
  readonly generated: boolean;
  readonly formatted: boolean;
  readonly parts: boolean;
}
