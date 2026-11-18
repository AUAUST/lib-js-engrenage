import type { NamedLabel } from "#tools/github/types/NamedLabel";

export interface LabelUpdate extends NamedLabel {
  readonly current: string;
}
