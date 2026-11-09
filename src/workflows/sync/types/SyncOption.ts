import type { Option } from "@commander-js/extra-typings";

export interface SyncOption {
  readonly target: string;
  readonly flag: string;
  readonly option: Option;
}
