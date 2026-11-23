import { entries, freeze, hasOwn, keys } from "@auaust/toolkit/object";

import { registerRoles, type RoleRegistry } from "#batiment/roles/index";
import type {
  DomainDeclaration,
  NamespaceDeclaration,
} from "#batiment/scopes/index";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { ValueOrigin } from "#foundation/options/index";
import type { Directory } from "#types/Directory";

const namespaceRoot = ".";

// @debt every default layer ranks alike, so two presets declaring a path as different kinds fail instead of the higher one winning
const originRanks: Readonly<Record<ValueOrigin["layer"], number>> = {
  declaration: 0,
  default: 1,
  input: 2,
};

export function flattenStructure({
  namespaceName,
  root,
  structure,
  published,
  origins,
}: {
  namespaceName: string;
  root: string;
  structure: NamespaceDeclaration;
  published: boolean;
  origins: ReadonlyMap<string, ValueOrigin>;
}): DeclaredStructure & {
  readonly defined: RoleRegistry;
  readonly optionPaths: Readonly<Record<Directory, string>>;
} {
  const defined: RoleRegistry = {
    contracts: {},
    aliases: {},
  };

  const namespaces: Record<
    Directory,
    DeclaredStructure["namespaces"][string]
  > = {};

  const domains: Record<string, DeclaredStructure["domains"][string]> = {};

  // @debt a directory name holding a dot breaks the dotted option path `Resolver.origin` reads
  const optionPaths: Record<Directory, string> = {};

  function childPath(parent: Directory, name: string): Directory {
    return parent === namespaceRoot ? name : `${parent}/${name}`;
  }

  function rankOrigin(optionPath: string): number {
    const origin = origins.get(optionPath);

    if (origin === undefined) {
      throw new Error(
        `The origin of "${optionPath}" is missing, so its node kind cannot be decided`,
      );
    }

    return originRanks[origin.layer];
  }

  function dropLowerKind(
    path: Directory,
    option: string,
    name: string,
  ): string {
    const namespace = rankOrigin(`${option}.namespaces.${name}`);
    const domain = rankOrigin(`${option}.domains.${name}`);

    if (namespace === domain) {
      throw new Error(
        `${childPath(path, name)} is declared as a namespace and as a domain in the ${namespaceName} environment`,
      );
    }

    return namespace > domain ? `domains.${name}` : `namespaces.${name}`;
  }

  function visitChildren(
    path: Directory,
    node: NamespaceDeclaration | DomainDeclaration,
    option: string,
  ) {
    const dropped = new Set(
      keys(node.namespaces)
        .filter((name) => hasOwn(node.domains, name))
        .map((name) => dropLowerKind(path, option, name)),
    );

    for (const [name, namespace] of entries(node.namespaces)) {
      if (dropped.has(`namespaces.${name}`)) {
        continue;
      }

      visitNamespace(
        childPath(path, name),
        namespace,
        `${option}.namespaces.${name}`,
      );
    }

    for (const [name, domain] of entries(node.domains)) {
      if (dropped.has(`domains.${name}`)) {
        continue;
      }

      const child = childPath(path, name);
      const domainOption = `${option}.domains.${name}`;

      optionPaths[child] = domainOption;

      domains[child] = freeze({
        specifier: domain.specifier,
        purpose: domain.purpose,
        internals: domain.internals,
        reexport: domain.reexport,
        collects: domain.collects,
        public: domain.public,
      });

      visitChildren(child, domain, domainOption);
    }
  }

  function visitNamespace(
    path: Directory,
    namespace: NamespaceDeclaration,
    option: string,
  ) {
    const enable = registerRoles({
      owner: `${namespaceName}:${path}`,
      path: `${option}.roles.enable`,
      roles: namespace.roles.enable,
      registry: defined,
      published,
    });

    optionPaths[path] = option;

    namespaces[path] = freeze({
      layers: namespace.layers,
      relation: namespace.relation,
      children: namespace.children,
      purpose: namespace.purpose,
      roles: freeze({ enable: freeze(enable) }),
    });

    visitChildren(path, namespace, option);
  }

  visitNamespace(namespaceRoot, structure, root);

  return freeze({
    namespaces: freeze(namespaces),
    domains: freeze(domains),
    defined,
    optionPaths: freeze(optionPaths),
  });
}
