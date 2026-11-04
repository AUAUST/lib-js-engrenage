import { relative } from "node:path";

import type { ProjectConfig } from "#project/config/index";
import type { StructureNode } from "#project/structure/index";
import type { StructureLocation } from "#tools/eslint/types/StructureLocation";

const environments = ["src", "scripts", "tooling", "tests"] as const;

function contains(node: StructureNode, path: string): boolean {
  return path.startsWith(`${node.path}/`);
}

export function locateInStructure(
  config: ProjectConfig,
  filename: string,
): StructureLocation | undefined {
  const path = relative(config.root, filename).replaceAll("\\", "/");

  for (const environment of environments) {
    const structure = config.structure[environment];

    const directory = structure?.dirs.find((dir) => path.startsWith(`${dir}/`));

    if (structure === undefined || directory === undefined) {
      continue;
    }

    let node = structure.root;

    for (;;) {
      const child = node.children.find((candidate) =>
        contains(candidate, path),
      );

      if (child === undefined) {
        break;
      }

      node = child;
    }

    const contract =
      node.role === undefined
        ? undefined
        : config[environment].roles.roles[node.role];

    return {
      environment,
      root: structure.root,
      indexFile: structure.indexFile,
      node,
      contract,
      relativePath: path.slice(
        (node === structure.root ? directory : node.path).length + 1,
      ),
    };
  }
}
