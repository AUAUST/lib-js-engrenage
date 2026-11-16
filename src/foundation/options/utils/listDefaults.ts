import { join, map as mapIterable } from "@auaust/toolkit/iterable";

export function listDefaults(values: readonly string[]): string {
  return join(
    mapIterable(values, (value) => `\`${value}\``),
    ", ",
  );
}
