import { join, map } from "@auaust/primitive-kit/arrays";

export function listDefaults(values: readonly string[]): string {
  return join(
    map(values, (value) => `\`${value}\``),
    ", ",
  );
}
