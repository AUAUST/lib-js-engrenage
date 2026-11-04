import type { JsonValue } from "#foundation/json/types/JsonValue";

export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}
