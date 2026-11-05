import type { JsonValue } from "#foundation/json/index";

// @debt same JSON round-trip as serialize in defineSchema; one shared JSON-value converter could serve both
export function toJsonValue(value: unknown, subject: string): JsonValue {
  const expression = JSON.stringify(value);

  if (expression === undefined) {
    throw new TypeError(`${subject} is not JSON-serializable`);
  }

  return JSON.parse(expression);
}
