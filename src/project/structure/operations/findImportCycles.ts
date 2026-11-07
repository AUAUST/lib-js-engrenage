import { readdir, readFile } from "node:fs/promises";
import { join, posix } from "node:path";

import {
  createSourceFile,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteral,
  ModuleKind,
  ScriptTarget,
  transpileModule,
} from "typescript";

import { flat, flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { isMissingError } from "#foundation/filesystem/index";
import { createImportResolver } from "#project/structure/utils/createImportResolver";
import type { ImportCycle } from "#project/structure/types/ImportCycle";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { Directory } from "#types/Directory";

const codeExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
const ignoredDirectories = new Set(["node_modules", "dist"]);

function isCodeFile(name: string): boolean {
  return (
    codeExtensions.some((extension) => name.endsWith(extension)) &&
    !name.endsWith(".d.ts")
  );
}

async function listCodeFiles(
  root: Directory,
  directory: Directory,
): Promise<string[]> {
  const path = join(root, directory);

  let entries;

  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }

  const listed = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const child = posix.join(directory, entry.name);

      if (entry.isDirectory()) {
        return entry.name.startsWith(".") || ignoredDirectories.has(entry.name)
          ? []
          : listCodeFiles(root, child);
      }

      return entry.isFile() && isCodeFile(entry.name) ? [child] : [];
    }),
  );

  return listed.flat();
}

async function readRuntimeSpecifiers(
  root: Directory,
  file: string,
  verbatimModuleSyntax: boolean,
): Promise<string[]> {
  const { outputText } = transpileModule(
    await readFile(join(root, file), "utf-8"),
    {
      fileName: file,
      compilerOptions: {
        module: ModuleKind.ESNext,
        target: ScriptTarget.Latest,
        verbatimModuleSyntax,
      },
    },
  );

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

function candidatesOf(path: string): string[] {
  const withoutExtension = path.replace(/\.(?:[cm]?js|[cm]?ts|tsx)$/, "");

  return [
    path,
    ...[".ts", ".tsx", ".mts", ".cts"].map((extension) => {
      return `${withoutExtension}${extension}`;
    }),
    ...[".ts", ".tsx"].map((extension) => `${path}${extension}`),
    ...["index.ts", "index.tsx"].map((index) => posix.join(path, index)),
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
  structure,
  aliases,
  verbatimModuleSyntax,
}: {
  root: Directory;
  structure: ResolvedStructure;
  aliases: ResolvedAliases;
  verbatimModuleSyntax: boolean;
}): Promise<ImportCycle[]> {
  const directories = new Set(
    flatMap(values(structure), (environment) => {
      return environment?.dirs ?? [];
    }),
  );

  const files = new Set(
    flat(
      await Promise.all(
        [...directories].map((directory) => listCodeFiles(root, directory)),
      ),
    ),
  );

  const resolveImport = createImportResolver({ root, aliases });

  function resolve(from: string, specifier: string): string | undefined {
    const resolved = resolveImport(specifier, from);

    return resolved?.kind === "relative" || resolved?.kind === "alias"
      ? candidatesOf(resolved.path).find((candidate) => files.has(candidate))
      : undefined;
  }

  const graph = new Map<string, string[]>(
    await Promise.all(
      [...files].sort().map(async (file): Promise<[string, string[]]> => {
        const targets = new Set(
          flatMap(
            await readRuntimeSpecifiers(root, file, verbatimModuleSyntax),
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
