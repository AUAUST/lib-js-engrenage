import { posix } from "node:path";

import {
  createSourceFile,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteral,
  ModuleKind,
  ScriptTarget,
  transpileModule,
} from "typescript";

import { flat, flatMap, map } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LanguageEntry } from "#project/environments/index";
import type { ImportCycle } from "#project/structure/types/ImportCycle";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { Directory } from "#types/Directory";

const ignoredDirectories = ["**/.*", "**/node_modules", "**/dist"];

interface ModuleFiles {
  readonly extensions: readonly string[];
  readonly declarations: readonly string[];
}

function readModuleFiles(languages: readonly LanguageEntry[]): ModuleFiles {
  const modules = languages.filter((language) => language.modules === true);

  return {
    extensions: flatMap(modules, (language) => language.extensions),
    declarations: flatMap(modules, (language) => {
      return language.declarations === undefined ? [] : [language.declarations];
    }),
  };
}

function isCodeFile(name: string, { extensions, declarations }: ModuleFiles) {
  return (
    extensions.some((extension) => name.endsWith(extension)) &&
    !declarations.some((declaration) => name.endsWith(declaration))
  );
}

async function listCodeFiles(
  filesystem: Filesystem,
  directory: Directory,
  modules: ModuleFiles,
): Promise<string[]> {
  const files = await filesystem.list(directory, { skip: ignoredDirectories });

  return files.filter((file) => isCodeFile(posix.basename(file), modules));
}

async function readRuntimeSpecifiers(
  filesystem: Filesystem,
  file: string,
  verbatimModuleSyntax: boolean,
): Promise<string[]> {
  const content = await filesystem.read(file);

  if (content === undefined) {
    throw new Error(`${file} was listed but cannot be read`);
  }

  const { outputText } = transpileModule(content, {
    fileName: file,
    compilerOptions: {
      module: ModuleKind.ESNext,
      target: ScriptTarget.Latest,
      verbatimModuleSyntax,
    },
  });

  const emitted = createSourceFile(file, outputText, ScriptTarget.Latest);

  return flatMap(emitted.statements, (statement): string[] => {
    if (isImportDeclaration(statement)) {
      return isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [];
    }

    if (
      isExportDeclaration(statement) &&
      statement.moduleSpecifier !== undefined
    ) {
      return isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [];
    }

    return [];
  });
}

function candidatesOf(path: string, { extensions }: ModuleFiles): string[] {
  const stripped = extensions
    .filter((extension) => path.endsWith(extension))
    .reduce((longest, extension) => {
      return extension.length > longest.length ? extension : longest;
    }, "");

  const withoutExtension = path.slice(0, path.length - stripped.length);

  return [
    path,
    ...map(extensions, (extension) => `${withoutExtension}${extension}`),
    ...map(extensions, (extension) => `${path}${extension}`),
    ...map(extensions, (extension) => posix.join(path, `index${extension}`)),
  ];
}

function findComponents(graph: ReadonlyMap<string, string[]>): string[][] {
  const order = new Map<string, number>();
  const reach = new Map<string, number>();
  const stack: string[] = [];
  const components: string[][] = [];

  function lower(node: string, value: number) {
    if (value < (reach.get(node) ?? value)) {
      reach.set(node, value);
    }
  }

  function visit(node: string) {
    const position = order.size;

    order.set(node, position);
    reach.set(node, position);
    stack.push(node);

    for (const next of graph.get(node) ?? []) {
      const nextOrder = order.get(next);

      if (nextOrder === undefined) {
        visit(next);
        lower(node, reach.get(next) ?? position);
      } else if (stack.includes(next)) {
        lower(node, nextOrder);
      }
    }

    if (reach.get(node) !== position) {
      return;
    }

    const component: string[] = [];

    for (let member = stack.pop(); member !== undefined; member = stack.pop()) {
      component.push(member);

      if (member === node) {
        break;
      }
    }

    components.push(component);
  }

  for (const node of graph.keys()) {
    if (!order.has(node)) {
      visit(node);
    }
  }

  return components;
}

function shortestCycle(
  graph: ReadonlyMap<string, string[]>,
  component: ReadonlySet<string>,
  start: string,
): string[] {
  const previous = new Map<string, string>();
  const queue = [start];

  for (let node = queue.shift(); node !== undefined; node = queue.shift()) {
    for (const next of graph.get(node) ?? []) {
      if (!component.has(next)) {
        continue;
      }

      if (next === start) {
        const path = [node];

        for (
          let parent = previous.get(node);
          parent !== undefined;
          parent = previous.get(parent)
        ) {
          path.unshift(parent);
        }

        return [...path, start];
      }

      if (previous.has(next)) {
        continue;
      }

      previous.set(next, node);
      queue.push(next);
    }
  }

  return [start, start];
}

/** @debt without `verbatimModuleSyntax`, elision is decided per file as under `isolatedModules`, so a value-style re-export of a type-only module still counts as a runtime edge */
export async function findImportCycles({
  root,
  filesystem,
  structure,
  aliases,
  verbatimModuleSyntax,
  languages,
}: {
  root: Directory;
  filesystem: Filesystem;
  structure: ResolvedStructure;
  aliases: ResolvedAliases;
  verbatimModuleSyntax: boolean;
  languages: readonly LanguageEntry[];
}): Promise<ImportCycle[]> {
  const modules = readModuleFiles(languages);

  const directories = new Set(
    flatMap(values(structure), (environment) => {
      return environment?.dirs ?? [];
    }),
  );

  const files = new Set(
    flat(
      await Promise.all(
        [...directories].map((directory) => {
          return listCodeFiles(filesystem, directory, modules);
        }),
      ),
    ),
  );

  const resolveImport = createImportResolver({ root, aliases });

  function resolve(from: string, specifier: string): string | undefined {
    const resolved = resolveImport(specifier, from);

    return resolved?.kind === "relative" || resolved?.kind === "alias"
      ? candidatesOf(resolved.path, modules).find((candidate) => {
          return files.has(candidate);
        })
      : undefined;
  }

  const graph = new Map<string, string[]>(
    await Promise.all(
      [...files].sort().map(async (file): Promise<[string, string[]]> => {
        const targets = new Set(
          flatMap(
            await readRuntimeSpecifiers(filesystem, file, verbatimModuleSyntax),
            (specifier) => {
              const target = resolve(file, specifier);

              return target === undefined ? [] : [target];
            },
          ),
        );

        return [file, [...targets].sort()];
      }),
    ),
  );

  const cycles = flatMap(findComponents(graph), (component): ImportCycle[] => {
    const [start] = [...component].sort();

    if (
      start === undefined ||
      (component.length === 1 && graph.get(start)?.includes(start) !== true)
    ) {
      return [];
    }

    return [shortestCycle(graph, new Set(component), start)];
  });

  return cycles.sort((a, b) => {
    return (a[0] ?? "").localeCompare(b[0] ?? "");
  });
}
