import type { JsonValue } from "#json/types/JsonValue";

export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}
