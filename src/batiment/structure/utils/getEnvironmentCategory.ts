import type { ImportCategory } from "#batiment/structure/types/ImportCategory";

export function getEnvironmentCategory(
  environment: string,
  entries: readonly string[],
): ImportCategory {
  return entries.includes(environment) ? "internal-aliases" : environment;
}
