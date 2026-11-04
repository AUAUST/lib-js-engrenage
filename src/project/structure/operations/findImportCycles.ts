import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

import {
  createSourceFile,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteral,
  ScriptTarget,
  type ExportDeclaration,
  type ImportDeclaration,
} from "typescript";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import type { Alias } from "#project/structure/types/Alias";
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

function listCodeFiles(root: Directory, directory: Directory): string[] {
  const path = join(root, directory);

  if (!existsSync(path)) {
    return [];
  }

  return flatMap(readdirSync(path, { withFileTypes: true }), (entry) => {
    const child = posix.join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name.startsWith(".") || ignoredDirectories.has(entry.name)
        ? []
        : listCodeFiles(root, child);
    }

    return entry.isFile() && isCodeFile(entry.name) ? [child] : [];
  });
}

function keepsImport(statement: ImportDeclaration): boolean {
  return statement.importClause?.isTypeOnly !== true;
}

function keepsExport(statement: ExportDeclaration): boolean {
  return !statement.isTypeOnly;
}

function readRuntimeSpecifiers(root: Directory, file: string): string[] {
  const source = createSourceFile(
    file,
    readFileSync(join(root, file), "utf-8"),
    ScriptTarget.Latest,
  );

  return flatMap(source.statements, (statement): string[] => {
    if (isImportDeclaration(statement) && keepsImport(statement)) {
      return isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [];
    }

    if (
      isExportDeclaration(statement) &&
      statement.moduleSpecifier !== undefined &&
      keepsExport(statement)
    ) {
      return isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [];
    }

    return [];
  });
}

function expandAlias(alias: Alias, specifier: string): string | undefined {
  const star = alias.key.indexOf("*");

  if (star === -1) {
    return specifier === alias.key ? alias.target : undefined;
  }

  const prefix = alias.key.slice(0, star);
  const suffix = alias.key.slice(star + 1);

  return specifier.startsWith(prefix) &&
    specifier.endsWith(suffix) &&
    specifier.length >= prefix.length + suffix.length
    ? alias.target.replace("*", () => {
        return specifier.slice(prefix.length, specifier.length - suffix.length);
      })
    : undefined;
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

function createResolver(aliases: readonly Alias[], files: ReadonlySet<string>) {
  return (from: string, specifier: string): string | undefined => {
    let target: string | undefined;

    if (specifier.startsWith(".")) {
      target = posix.join(posix.dirname(from), specifier);
    } else if (specifier.startsWith("#")) {
      for (const alias of aliases) {
        const expanded = expandAlias(alias, specifier);

        if (expanded !== undefined) {
          target = posix.normalize(expanded);
          break;
        }
      }
    }

    return target === undefined
      ? undefined
      : candidatesOf(target).find((candidate) => files.has(candidate));
  };
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

/** @debt `typescript` is an optional peer dependency yet this runtime module imports it; and `verbatimModuleSyntax` is assumed on instead of read from the resolved typescript option */
export function findImportCycles({
  root,
  structure,
  aliases,
}: {
  root: Directory;
  structure: ResolvedStructure;
  aliases: ResolvedAliases;
}): ImportCycle[] {
  const directories = new Set(
    flatMap(values(structure), (environment) => {
      return environment?.dirs ?? [];
    }),
  );

  const files = new Set(
    flatMap([...directories], (directory) => listCodeFiles(root, directory)),
  );

  const resolve = createResolver([...aliases.global, ...aliases.src], files);

  const graph = new Map<string, string[]>(
    [...files].sort().map((file) => {
      const targets = new Set(
        flatMap(readRuntimeSpecifiers(root, file), (specifier) => {
          const target = resolve(file, specifier);

          return target === undefined ? [] : [target];
        }),
      );

      return [file, [...targets].sort()];
    }),
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
