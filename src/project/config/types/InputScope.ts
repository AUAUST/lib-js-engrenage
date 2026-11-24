import type { KeyScope } from "#project/config/types/KeyScope";

export interface InputScope {
  readonly scope: KeyScope;
  readonly key: string;
}
