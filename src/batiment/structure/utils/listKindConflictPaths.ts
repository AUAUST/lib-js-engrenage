import { entries, hasOwn, keys } from "@auaust/toolkit/object";

import type {
  DomainDeclaration,
  NamespaceDeclaration,
} from "#batiment/scopes/index";

export function listKindConflictPaths({
  root,
  structure,
}: {
  root: string;
  structure: NamespaceDeclaration;
}): string[] {
  function visit(
    node: NamespaceDeclaration | DomainDeclaration,
    option: string,
  ): string[] {
    const conflicts = keys(node.namespaces)
      .filter((name) => hasOwn(node.domains, name))
      .flatMap((name) => {
        return [`${option}.namespaces.${name}`, `${option}.domains.${name}`];
      });

    const namespaces = entries(node.namespaces).flatMap(([name, child]) => {
      return visit(child, `${option}.namespaces.${name}`);
    });

    const domains = entries(node.domains).flatMap(([name, child]) => {
      return visit(child, `${option}.domains.${name}`);
    });

    return [...conflicts, ...namespaces, ...domains];
  }

  return visit(structure, root);
}
