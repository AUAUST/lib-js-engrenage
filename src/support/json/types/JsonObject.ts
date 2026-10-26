import type { JsonValue } from "#support/json/types/JsonValue";

export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}
