import { iterable } from "@auaust/toolkit";

export function listDefaults(values: readonly string[]): string {
  return iterable.join(
    iterable.map(values, (value) => `\`${value}\``),
    ", ",
  );
}
