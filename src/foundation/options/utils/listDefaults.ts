import { map } from "@auaust/primitive-kit/arrays";
import { join } from "@auaust/toolkit/array";

export function listDefaults(values: readonly string[]): string {
  return join(
    map(values, (value) => `\`${value}\``),
    ", ",
  );
}
