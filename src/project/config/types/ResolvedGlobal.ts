import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { GlobalScope } from "#project/config/types/GlobalScope";

export interface ResolvedGlobal {
  readonly expression: string;
  readonly value: JsonValue;
  readonly exact: boolean;
  readonly type: string | undefined;
  readonly scope: GlobalScope;
  readonly description: string | undefined;
}
