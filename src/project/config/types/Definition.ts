import type { definitionKey } from "#project/config/constants";
import type { GlobalScope } from "#project/config/types/GlobalScope";

export interface Definition {
  readonly [definitionKey]: true;
  readonly value: unknown;
  readonly exact: boolean;
  readonly type: string | undefined;
  readonly scope: GlobalScope;
  readonly description: string | undefined;
}
