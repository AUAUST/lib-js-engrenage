import { isPlainObject } from "@auaust/toolkit";
import { entries, record } from "@auaust/toolkit/object";

// @debt a key holding a dot splits into two path segments once laid out, as in preset layers
/**
 * `value` laid out as an input layer's values, by the dotted path of each leaf
 * under `path`, so a lower layer still fills every path a higher one leaves unset.
 */
export function flattenInput(
  path: string,
  value: unknown,
): Readonly<Record<string, unknown>> {
  const children = isPlainObject(value) ? entries(value) : [];

  if (children.length === 0) {
    return { [path]: value };
  }

  return record(
    children.flatMap(([key, nested]) => {
      return entries(flattenInput(`${path}.${key}`, nested));
    }),
  );
}
