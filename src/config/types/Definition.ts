import type { definitionKey } from "#config/constants";
import type { GlobalScope } from "#config/types/GlobalScope";

export interface Definition {
  readonly [definitionKey]: true;
  readonly value: unknown;
  readonly exact: boolean;
  readonly type: string | undefined;
  readonly scope: GlobalScope;
  readonly description: string | undefined;
}
