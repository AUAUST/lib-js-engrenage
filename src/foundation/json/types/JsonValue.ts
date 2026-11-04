import type { JsonObject } from "#json/types/JsonObject";

export type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | JsonObject;
