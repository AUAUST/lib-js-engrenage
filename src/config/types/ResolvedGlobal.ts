import type { GlobalScope } from "#config/types/GlobalScope";
import type { JsonValue } from "#support/json/types/JsonValue";

export interface ResolvedGlobal {
  readonly expression: string;
  readonly value: JsonValue;
  readonly exact: boolean;
  readonly type: string | undefined;
  readonly scope: GlobalScope;
}
