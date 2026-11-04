import type { JsonObject } from "#foundation/json/types/JsonObject";

export type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | JsonObject;
