import type { Label } from "#tools/github/types/Label";

export interface NamedLabel extends Label {
  readonly name: string;
}
