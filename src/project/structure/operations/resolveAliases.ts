import { join, posix } from "node:path";

import { flat, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import type { Filesystem } from "#foundation/filesystem/index";
import type { LanguageEntry } from "#project/environments/index";
import type { Alias } from "#project/structure/types/Alias";
import type { AliasesOption } from "#project/structure/types/AliasesOption";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const projectRoot = ".";
const bundlerPrefix = "#";

interface AliasedFiles {
  readonly extension: string;
  readonly declarations: string | undefined;
}

function readAliasedFiles({
  name,
  extensions: [extension],
  declarations,
}: LanguageEntry): AliasedFiles {
  if (extension === undefined) {
    throw new Error(`The ${name} language lists no file extension to alias`);
  }

  return { extension, declarations };
}

const packageJsonAlias: Alias = {
  key: "#package.json",
  target: "./package.json",
  source: "project root",
};

async function createDirectoryAliases(
  filesystem: Filesystem,
  name: string,
  path: Directory,
  source: string,
  indexFile: string,
  extension: string,
): Promise<Alias[]> {
  return [
    {
      key: `#${name}/*`,
      target: `./${path}/*${extension}`,
      source,
    },
    ...((await filesystem.exists(join(path, indexFile)))
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
  filesystem: Filesystem,
  { dirs, root: tree, indexFile, entryFile }: EnvironmentStructure,
  { extension, declarations }: AliasedFiles,
): Promise<Alias[]> {
  const directories = flat(
    await Promise.all(
      tree.children.map(async (child) => {
        const aliases = await createDirectoryAliases(
          filesystem,
          child.name,
          child.path,
          `src entry ${child.path}`,
          indexFile,
          extension,
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
        const listed = await filesystem.list(dir, { recursive: false });

        return listed
          .map((file) => posix.basename(file))
          .filter((name) => {
            return (
              name.endsWith(extension) &&
              (declarations === undefined || !name.endsWith(declarations)) &&
              name !== indexFile &&
              name !== entryFile
            );
          })
          .map((name): Alias => {
            return {
              key: `#${name.slice(0, -extension.length)}`,
              target: `./${join(dir, name)}`,
              source: `src entry ${join(dir, name)}`,
              path: join(dir, name),
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
  filesystem,
  options,
  bundled,
  environments,
  data,
  published,
  outDir,
  structure,
  language,
}: {
  filesystem: Filesystem;
  options: { global: AliasesOption; src: AliasesOption };
  bundled: boolean;
  environments: Readonly<Record<string, Directories>>;
  data: Directories;
  published: boolean;
  outDir: Directory | undefined;
  structure: EnvironmentStructure | undefined;
  language: LanguageEntry;
}): Promise<ResolvedAliases> {
  if (!options.global.enabled) {
    return freeze({
      enabled: false,
      global: [],
      src: [],
    });
  }

  const files = readAliasedFiles(language);

  const generatedSource = (
    options.src.enabled && options.src.generated && structure !== undefined
  );

  const roots = flat(
    await Promise.all(
      entries(environments).flatMap(([name, dirs]) => {
        if (name === "src" && generatedSource) {
          return [];
        }

        return dirs.map(async (dir): Promise<Alias[]> => {
          return dir === projectRoot ||
            dir === outDir ||
            !(await filesystem.isDirectory(dir))
            ? []
            : [
                {
                  key: `#${dir}/*`,
                  target: `./${dir}/*${files.extension}`,
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
            return (await filesystem.isDirectory(dir))
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
        ...(generatedSource
          ? await createSourceAliases(filesystem, structure, files)
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
