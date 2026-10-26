import type { JsonObject } from "#support/json/types/JsonObject";

export type JsonValue =
  string | number | boolean | null | ReadonlyArray<JsonValue> | JsonObject;
