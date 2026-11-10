import { map, sort } from "@auaust/primitive-kit/arrays";

import type { TypeSource } from "#scripts/codegen/types/TypeSource";
import type { Directory } from "#types/Directory";

export function findConfigTypeImports(
  declarations: string,
  name: string,
  domain: Directory,
  sources: ReadonlyMap<string, TypeSource>,
): string[] {
  const code = declarations.replaceAll(/\/\*[\s\S]*?\*\//g, "");

  const specifiers = new Map<string, string[]>();

  for (const [used, source] of sources) {
    if (used === name || !new RegExp(String.raw`\b${used}\b`).test(code)) {
      continue;
    }

    const specifier = (
      source.specifier ??
      (source.domain === domain
        ? `#${source.domain}/types/${used}`
        : `#${source.domain}/index`)
    );

    specifiers.set(specifier, [...(specifiers.get(specifier) ?? []), used]);
  }

  return map(sort([...specifiers.keys()]), (specifier) => {
    return `import type { ${sort(specifiers.get(specifier) ?? []).join(", ")} } from "${specifier}";`;
  });
}
