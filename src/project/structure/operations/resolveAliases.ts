import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import type { Alias } from "#project/structure/types/Alias";
import type { AliasesOption } from "#project/structure/types/AliasesOption";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const projectRoot = ".";
const bundlerPrefix = "#";

const packageJsonAlias: Alias = {
  key: "#package.json",
  target: "./package.json",
  source: "project root",
};

function createDirectoryAliases(
  root: Directory,
  name: string,
  path: Directory,
  source: string,
  indexFile: string,
): Alias[] {
  return [
    {
      key: `#${name}/*`,
      target: `./${path}/*.ts`,
      source,
    },
    ...(existsSync(join(root, path, indexFile))
      ? [
          {
            key: `#${name}`,
            target: `./${path}/${indexFile}`,
            source,
          },
        ]
      : []),
  ];
}

function createSourceAliases(
  root: Directory,
  { dirs, root: tree, indexFile }: EnvironmentStructure,
): Alias[] {
  const directories = flatMap(tree.children, (child) => {
    return createDirectoryAliases(
      root,
      child.name,
      child.path,
      `src entry ${child.path}`,
      indexFile,
    );
  });

  // @debt every root file gets an alias, including `#entry` for the package entry that no rule lets anything import; aliases should follow the import rules
  const files = flatMap(dirs, (dir) => {
    if (!existsSync(join(root, dir))) {
      return [];
    }

    return readdirSync(join(root, dir), { withFileTypes: true })
      .filter((entry) => {
        return (
          entry.isFile() &&
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".d.ts")
        );
      })
      .map((entry): Alias => {
        return {
          key: `#${entry.name.slice(0, -".ts".length)}`,
          target: `./${join(dir, entry.name)}`,
          source: `src entry ${join(dir, entry.name)}`,
        };
      });
  });

  return [...directories, ...files];
}

function createDefinedAliases(
  option: AliasesOption,
  source: string,
  bundled: boolean,
): Alias[] {
  return map(entries(option.define), ([key, target]): Alias => {
    if (!key.startsWith(bundlerPrefix) && !bundled) {
      throw new Error(
        `${source} defines the bundler alias ${key}, which needs src.bundled`,
      );
    }

    return {
      key,
      target,
      source,
    };
  });
}

function assertUnique(aliases: readonly Alias[]) {
  const seen = new Map<string, Alias>();

  for (const alias of aliases) {
    const previous = seen.get(alias.key);

    if (previous !== undefined) {
      throw new Error(
        `Alias ${alias.key} is declared by ${previous.source} and by ${alias.source}`,
      );
    }

    seen.set(alias.key, alias);
  }
}

export function resolveAliases({
  root,
  options,
  bundled,
  environments,
  data,
  published,
  outDir,
  structure,
}: {
  root: Directory;
  options: { global: AliasesOption; src: AliasesOption };
  bundled: boolean;
  environments: Readonly<Record<string, Directories>>;
  data: Directories;
  published: boolean;
  outDir: Directory | undefined;
  structure: EnvironmentStructure | undefined;
}): ResolvedAliases {
  if (!options.global.enabled) {
    return freeze({
      enabled: false,
      global: [],
      src: [],
    });
  }

  // @debt `#src/*` is generated beside the namespace aliases, so every src module has two specifiers (`#src/project/config/index`, `#project/config/index`)
  const roots = flatMap(entries(environments), ([name, dirs]) => {
    return flatMap(dirs, (dir): Alias[] => {
      return dir === projectRoot ||
        dir === outDir ||
        !existsSync(join(root, dir))
        ? []
        : [
            {
              key: `#${dir}/*`,
              target: `./${dir}/*.ts`,
              source: `${name} environment`,
            },
          ];
    });
  });

  const dataAliases = published
    ? []
    : flatMap(data, (dir): Alias[] => {
        return existsSync(join(root, dir))
          ? [
              {
                key: `#${dir}/*`,
                target: `./${dir}/*`,
                source: "data environment",
              },
            ]
          : [];
      });

  const global = [
    ...(options.global.generated
      ? [...roots, ...dataAliases, packageJsonAlias]
      : []),
    ...createDefinedAliases(options.global, "aliases.define", bundled),
  ];

  const sourceAliases = options.src.enabled
    ? [
        ...(options.src.generated && structure !== undefined
          ? createSourceAliases(root, structure)
          : []),
        ...createDefinedAliases(options.src, "src.aliases.define", bundled),
      ]
    : [];

  assertUnique([...global, ...sourceAliases]);

  return freeze({
    enabled: true,
    global,
    src: sourceAliases,
  });
}
