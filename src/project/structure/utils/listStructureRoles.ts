import { join } from "node:path";

import { entries, freeze, record } from "@auaust/toolkit/object";

import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureRole } from "#project/structure/types/StructureRole";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

const anyFile: Glob = "**";

export function listStructureRoles(
  root: StructureNode,
  rootFiles: readonly { directory: Directory; roles: ResolvedRoles }[],
  rolesIn: ReadonlyMap<StructureNode, ResolvedRoles>,
): Readonly<Record<string, StructureRole>> {
  const files = new Map<string, Set<Glob>>();
  const ignores = new Map<string, Set<Glob>>();
  const contracts = new Map<string, StructureRole["contract"]>();

  function add(
    target: Map<string, Set<Glob>>,
    role: string,
    globs: readonly Glob[],
  ) {
    const set = target.get(role) ?? new Set();

    for (const glob of globs) {
      set.add(glob);
    }

    target.set(role, set);
  }

  function addFileRoles(directory: Directory, roles: ResolvedRoles) {
    for (const [name, contract] of entries(roles.roles)) {
      if (contract.file === undefined) {
        continue;
      }

      contracts.set(name, contract);

      add(
        files,
        name,
        listStaticFileGlobs(contract.file).map((glob) => join(directory, glob)),
      );
    }
  }

  function visit(node: StructureNode) {
    const roles = rolesIn.get(node);

    const contract = node.role === undefined
      ? undefined
      : roles?.roles[node.role];

    if (node.role !== undefined && contract !== undefined) {
      contracts.set(node.role, contract);
      add(files, node.role, [join(node.path, anyFile)]);

      add(
        ignores,
        node.role,
        node.children.map((child) => join(child.path, anyFile)),
      );

      for (const name of contract.roles ?? []) {
        const nested = roles?.roles[name];

        if (nested?.file === undefined) {
          continue;
        }

        const globs = (
          node.fileNames?.[name] ?? listStaticFileGlobs(nested.file)
        ).map((glob) => join(node.path, glob));

        contracts.set(name, nested);
        add(files, name, globs);
        add(ignores, node.role, globs);
      }
    } else if (node.kind !== "role" && roles !== undefined) {
      addFileRoles(node.path, roles);
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const { directory, roles } of rootFiles) {
    addFileRoles(directory, roles);
  }

  for (const child of root.children) {
    visit(child);
  }

  return freeze(
    record(
      [...contracts].map(([name, contract]) => {
        return [
          name,
          freeze({
            contract,
            files: freeze([...(files.get(name) ?? [])]),
            ignores: freeze([...(ignores.get(name) ?? [])]),
          }),
        ] as const;
      }),
    ),
  );
}
