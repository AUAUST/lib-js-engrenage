import { join, posix } from "node:path";

import { flat, map } from "@auaust/toolkit/array";
import { entries, freeze } from "@auaust/toolkit/object";

import {
  listNamespaceDirectories,
  type Alias,
  type NamespaceStructure,
  type ResolvedAliases,
} from "#batiment/structure/index";
import {
  findFileExtension,
  type LanguageEntry,
  type LanguageExtensions,
} from "#project/environments/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { AliasesOption } from "#project/structure/types/AliasesOption";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

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

function targetOf(scope: Directory, path: string): string {
  return `./${posix.relative(scope, path)}`;
}

async function createDirectoryAliases(
  filesystem: Filesystem,
  scope: Directory,
  name: string,
  path: Directory,
  indexFile: string,
  extension: string,
): Promise<Alias[]> {
  const source = `src entry ${path}`;

  return [
    {
      key: `#${name}/*`,
      target: `${targetOf(scope, path)}/*${extension}`,
      source,
      path,
    },
    ...((await filesystem.exists(join(path, indexFile)))
      ? [
          {
            key: `#${name}`,
            target: targetOf(scope, join(path, indexFile)),
            source,
            path,
          },
        ]
      : []),
  ];
}

async function createSourceAliases(
  filesystem: Filesystem,
  scope: Directory,
  structure: NamespaceStructure,
  { extension, declarations }: AliasedFiles,
  extensionsOf: LanguageExtensions,
): Promise<Alias[]> {
  const { dirs, indexFile, entryFile } = structure;

  const children = listNamespaceDirectories(structure).flatMap(({ node }) => {
    return node.children;
  });

  const directories = flat(
    await Promise.all(
      children.map((child) => {
        return createDirectoryAliases(
          filesystem,
          scope,
          child.name,
          child.path,
          indexFile,
          extension,
        );
      }),
    ),
  );

  const files = flat(
    await Promise.all(
      dirs.map(async (dir): Promise<Alias[]> => {
        const listed = await filesystem.list(dir, {
          recursive: false,
        });

        return listed.flatMap((file): Alias[] => {
          const name = posix.basename(file);

          const path = join(dir, name);

          if (
            name === indexFile ||
            name === entryFile ||
            (declarations !== undefined && name.endsWith(declarations))
          ) {
            return [];
          }

          const found = findFileExtension(name, extensionsOf(path));

          return found === undefined
            ? []
            : [
                {
                  key: `#${name.slice(0, -found.length)}`,
                  target: targetOf(scope, path),
                  source: `src entry ${path}`,
                  path,
                },
              ];
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
        `${source} defines the bundler alias ${key}, which needs the src environment's bundler pass, environments.src.bundled`,
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
  scope,
  options,
  bundled,
  namespaces,
  data,
  outDir,
  source,
  language,
  extensionsOf,
}: {
  filesystem: Filesystem;
  scope: Directory;
  options: { global: AliasesOption; src: AliasesOption };
  bundled: boolean;
  namespaces: Readonly<Record<string, Directories>>;
  data: Directories;
  outDir: Directory | undefined;
  source:
    | { readonly name: string; readonly structure: NamespaceStructure }
    | undefined;
  language: LanguageEntry;
  extensionsOf: LanguageExtensions;
}): Promise<ResolvedAliases> {
  if (!options.global.enabled) {
    return freeze({
      enabled: false,
      global: [],
      src: [],
    });
  }

  const files = readAliasedFiles(language);

  const generatedSource = options.src.enabled && options.src.generated
    ? source
    : undefined;

  const roots = flat(
    await Promise.all(
      entries(namespaces).flatMap(([name, dirs]) => {
        if (name === generatedSource?.name) {
          return [];
        }

        return dirs.map(async (dir): Promise<Alias[]> => {
          return dir === scope ||
            dir === outDir ||
            !(await filesystem.isDirectory(dir))
            ? []
            : [
                {
                  key: `#${posix.relative(scope, dir)}/*`,
                  target: `${targetOf(scope, dir)}/*${files.extension}`,
                  source: `${name} environment`,
                  path: dir,
                },
              ];
        });
      }),
    ),
  );

  const dataAliases = flat(
    await Promise.all(
      data.map(async (dir): Promise<Alias[]> => {
        return (await filesystem.isDirectory(dir))
          ? [
              {
                key: `#${posix.relative(scope, dir)}/*`,
                target: `${targetOf(scope, dir)}/*`,
                source: "data environment",
                path: dir,
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
        ...(generatedSource === undefined
          ? []
          : await createSourceAliases(
              filesystem,
              scope,
              generatedSource.structure,
              files,
              extensionsOf,
            )),
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
