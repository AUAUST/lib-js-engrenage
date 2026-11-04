import { assertSerializable } from "#project/config/utils/assertSerializable";

export function serialize(value: unknown): string {
  const expression = JSON.stringify(value, assertSerializable);

  if (expression === undefined) {
    throw new TypeError("Expected a JSON-serializable value");
  }

  return expression;
}
