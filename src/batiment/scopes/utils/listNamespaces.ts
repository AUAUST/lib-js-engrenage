import { flatMap } from "@auaust/toolkit/array";
import { freeze, values } from "@auaust/toolkit/object";

import type { NamespaceInstance } from "#batiment/scopes/types/NamespaceInstance";
import type { ScopeTree } from "#batiment/scopes/types/ScopeTree";

/**
 * Lists the top-level namespaces of every scope of the tree.
 */
export function listNamespaces({
  scopes,
}: ScopeTree): readonly NamespaceInstance[] {
  return freeze(
    flatMap(values(scopes), (scope) => {
      return scope?.namespaces ?? [];
    }),
  );
}
