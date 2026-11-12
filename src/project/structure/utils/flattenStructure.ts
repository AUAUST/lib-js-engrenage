import { entries, freeze, hasOwn, keys } from "@auaust/toolkit/object";

import { registerRoles } from "#project/structure/utils/registerRoles";
import type {
  DomainDeclaration,
  NamespaceDeclaration,
} from "#project/environments/index";
import type { DeclaredStructure } from "#project/structure/types/DeclaredStructure";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";
import type { Directory } from "#types/Directory";

const environmentRoot = ".";

export function flattenStructure({
  environment,
  structure,
}: {
  environment: string;
  structure: NamespaceDeclaration;
}): DeclaredStructure & { readonly defined: RoleRegistry } {
  const defined: RoleRegistry = {
    contracts: {},
    aliases: {},
  };

  const namespaces: Record<
    Directory,
    DeclaredStructure["namespaces"][string]
  > = {};

  const domains: Record<string, DeclaredStructure["domains"][string]> = {};

  function childPath(parent: Directory, name: string): Directory {
    return parent === environmentRoot ? name : `${parent}/${name}`;
  }

  function visitChildren(
    path: Directory,
    node: NamespaceDeclaration | DomainDeclaration,
    option: string,
  ) {
    for (const name of keys(node.namespaces)) {
      if (hasOwn(node.domains, name)) {
        throw new Error(
          `${childPath(path, name)} is declared as a namespace and as a domain in the ${environment} environment`,
        );
      }
    }

    for (const [name, namespace] of entries(node.namespaces)) {
      visitNamespace(
        childPath(path, name),
        namespace,
        `${option}.namespaces.${name}`,
      );
    }

    for (const [name, domain] of entries(node.domains)) {
      const child = childPath(path, name);

      domains[child] = freeze({
        specifier: domain.specifier,
        purpose: domain.purpose,
        internals: domain.internals,
        reexport: domain.reexport,
        collects: domain.collects,
        public: domain.public,
      });

      visitChildren(child, domain, `${option}.domains.${name}`);
    }
  }

  function visitNamespace(
    path: Directory,
    namespace: NamespaceDeclaration,
    option: string,
  ) {
    const enable = registerRoles({
      owner: `${environment}:${path}`,
      path: `${option}.roles.enable`,
      roles: namespace.roles.enable,
      registry: defined,
    });

    namespaces[path] = freeze({
      layers: namespace.layers,
      relation: namespace.relation,
      children: namespace.children,
      purpose: namespace.purpose,
      roles: freeze({ enable: freeze(enable) }),
    });

    visitChildren(path, namespace, option);
  }

  visitNamespace(environmentRoot, structure, `${environment}.structure`);

  return freeze({
    namespaces: freeze(namespaces),
    domains: freeze(domains),
    defined,
  });
}
