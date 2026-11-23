import { entries, getOwn } from "@auaust/toolkit/object";

import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { Directory } from "#types/Directory";

export function listDeclaredOptionPaths({
  declared,
  optionPaths,
}: {
  declared: DeclaredStructure;
  optionPaths: Readonly<Record<Directory, string>>;
}): string[] {
  const nodes = [...entries(declared.namespaces), ...entries(declared.domains)];

  return nodes.flatMap(([path, node]) => {
    const option = getOwn(optionPaths, path);

    if (option === undefined) {
      return [];
    }

    const fields = entries(node)
      .filter(([, value]) => value !== undefined)
      .map(([field]) => `${option}.${field}`);

    return [option, ...fields];
  });
}
