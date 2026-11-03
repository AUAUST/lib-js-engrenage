import { entries } from "@auaust/toolkit/object";

import { resolveImportTarget } from "#typescript/utils/resolveImportTarget";
import type { File } from "#types/File";
import type { SubpathImports } from "#typescript/types/SubpathImports";

export function resolveSubpathImport(
  imports: SubpathImports,
  specifier: string,
): File | undefined {
  for (const [pattern, conditions] of entries(imports)) {
    const target = resolveImportTarget(conditions);

    if (target === undefined) {
      continue;
    }

    const [prefix = "", suffix, ...rest] = pattern.split("*");

    if (suffix === undefined) {
      if (pattern === specifier) {
        return target;
      }

      continue;
    }

    if (
      rest.length === 0 &&
      specifier.length >= prefix.length + suffix.length &&
      specifier.startsWith(prefix) &&
      specifier.endsWith(suffix)
    ) {
      const captured = specifier.slice(
        prefix.length,
        specifier.length - suffix.length,
      );

      return target.replace("*", () => captured);
    }
  }
}
