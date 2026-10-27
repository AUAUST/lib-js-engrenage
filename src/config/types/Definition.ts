import type { definitionKey } from "#config/constants";
import type { GlobalScope } from "#config/types/GlobalScope";
import type { JsonValue } from "#support/json/types/JsonValue";

export interface Definition {
  readonly [definitionKey]: true;
  readonly value: JsonValue;
  readonly exact: boolean;
  readonly type: string | undefined;
  readonly scope: GlobalScope;
}
