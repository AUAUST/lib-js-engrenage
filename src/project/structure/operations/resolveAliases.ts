import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { flat, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import { pathExists } from "#foundation/filesystem/index";
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

async function createDirectoryAliases(
  root: Directory,
  name: string,
  path: Directory,
  source: string,
  indexFile: string,
): Promise<Alias[]> {
  return [
    {
      key: `#${name}/*`,
      target: `./${path}/*.ts`,
      source,
    },
    ...((await pathExists(join(root, path, indexFile)))
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

async function createSourceAliases(
  root: Directory,
  { dirs, root: tree, indexFile, entryFile }: EnvironmentStructure,
): Promise<Alias[]> {
  const directories = flat(
    await Promise.all(
      tree.children.map(async (child) => {
        const aliases = await createDirectoryAliases(
          root,
          child.name,
          child.path,
          `src entry ${child.path}`,
          indexFile,
        );

        return aliases.map((alias) => {
          return { ...alias, path: child.path };
        });
      }),
    ),
  );

  const files = flat(
    await Promise.all(
      dirs.map(async (dir): Promise<Alias[]> => {
        if (!(await pathExists(join(root, dir)))) {
          return [];
        }

        const entries = await readdir(join(root, dir), { withFileTypes: true });

        return entries
          .filter((entry) => {
            return (
              entry.isFile() &&
              entry.name.endsWith(".ts") &&
              !entry.name.endsWith(".d.ts") &&
              entry.name !== indexFile &&
              entry.name !== entryFile
            );
          })
          .map((entry): Alias => {
            return {
              key: `#${entry.name.slice(0, -".ts".length)}`,
              target: `./${join(dir, entry.name)}`,
              source: `src entry ${join(dir, entry.name)}`,
              path: join(dir, entry.name),
            };
          });
      }),
    ),
  );

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

export async function resolveAliases({
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
}): Promise<ResolvedAliases> {
  if (!options.global.enabled) {
    return freeze({
      enabled: false,
      global: [],
      src: [],
    });
  }

  const generatedSource =
    options.src.enabled && options.src.generated && structure !== undefined;

  const roots = flat(
    await Promise.all(
      entries(environments).flatMap(([name, dirs]) => {
        if (name === "src" && generatedSource) {
          return [];
        }

        return dirs.map(async (dir): Promise<Alias[]> => {
          return dir === projectRoot ||
            dir === outDir ||
            !(await pathExists(join(root, dir)))
            ? []
            : [
                {
                  key: `#${dir}/*`,
                  target: `./${dir}/*.ts`,
                  source: `${name} environment`,
                },
              ];
        });
      }),
    ),
  );

  const dataAliases = published
    ? []
    : flat(
        await Promise.all(
          data.map(async (dir): Promise<Alias[]> => {
            return (await pathExists(join(root, dir)))
              ? [
                  {
                    key: `#${dir}/*`,
                    target: `./${dir}/*`,
                    source: "data environment",
                  },
                ]
              : [];
          }),
        ),
      );

  const global = [
    ...(options.global.generated
      ? [...roots, ...dataAliases, packageJsonAlias]
      : []),
    ...createDefinedAliases(options.global, "aliases.define", bundled),
  ];

  const sourceAliases = options.src.enabled
    ? [
        ...(generatedSource ? await createSourceAliases(root, structure) : []),
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
