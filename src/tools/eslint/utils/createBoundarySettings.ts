import { fileURLToPath } from "node:url";

import type { Settings } from "eslint-plugin-boundaries";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import type { StructureNode } from "#project/structure/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { Glob } from "#types/Glob";

// @debt duplicates `elementEnvironments` from `#project/structure` constants
const elementEnvironments = ["src", "scripts", "tooling"] as const;

function createFileCategory(role: string): string {
  return role.replaceAll(/\W+/g, "-").replaceAll(/^-|-$/g, "");
}

function collect(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collect)];
}

function byDepth(a: StructureNode, b: StructureNode): number {
  return b.path.split("/").length - a.path.split("/").length;
}

function listFiles(config: ConventionConfig): {
  category: string;
  pattern: Glob[];
}[] {
  const workspaceGlobs = flatMap(config.workspaces, ({ globs }) => {
    return [...globs];
  });

  const environments = [
    { category: "src", pattern: [...config.src.globs] },
    { category: "bin", pattern: [...config.bin.globs] },
    { category: "scripts", pattern: [...config.scripts.globs] },
    { category: "tests", pattern: [...config.tests.globs] },
    { category: "tooling", pattern: [...config.tooling.globs] },
    { category: "workspaces", pattern: workspaceGlobs },
  ];

  const roleFiles = flatMap(elementEnvironments, (name) => {
    return flatMap(entries(config[name].roles.roles), ([role, contract]) => {
      return contract.file === undefined
        ? []
        : [
            {
              name,
              role,
              globs: contract.file,
            },
          ];
    });
  });

  return [
    ...environments.filter(({ pattern }) => pattern.length > 0),
    ...roleFiles.map(({ name, role, globs }) => {
      return {
        category: createFileCategory(role),
        pattern: flatMap([globs].flat(), (glob) => {
          return config[name].dirs.map((dir) => `${dir}/**/${glob}`);
        }),
      };
    }),
  ];
}

function resolveResolver(): string {
  return fileURLToPath(
    import.meta.resolve("eslint-import-resolver-typescript"),
  );
}

// @debt the element and role file-category settings serve no policy since layers and surfaces left the plugin, yet the plugin still classifies every file with them; #282 removes them with the plugin
export function createBoundarySettings(config: ConventionConfig): Settings {
  const nodes = flatMap(elementEnvironments, (name) => {
    const structure = config.structure[name];

    return structure === undefined ? [] : collect(structure.root);
  })
    .filter(({ kind }) => {
      return kind === "domain" || kind === "role";
    })
    .sort(byDepth);

  return freeze({
    "boundaries/root-path": config.root,
    "boundaries/legacy-templates": false,
    "boundaries/elements": nodes.map(({ kind, path }) => {
      return {
        type: kind,
        pattern: path,
        partialMatch: false,
      };
    }),
    "boundaries/files": listFiles(config),
    "import/resolver": {
      [resolveResolver()]: {
        project: config.typescript.tsconfig.path,
      },
    },
  });
}
