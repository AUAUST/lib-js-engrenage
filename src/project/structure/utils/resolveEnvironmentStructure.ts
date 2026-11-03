import { existsSync, readdirSync } from "node:fs";
import { join, matchesGlob } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze } from "@auaust/toolkit/object";

import { noRoles } from "#project/structure/constants";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RolesOption } from "#project/structure/types/RolesOption";
import type { StructureEnvironment } from "#project/structure/types/StructureEnvironment";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

type DomainDeclaration = NonNullable<StructureOptions["domains"]>[string];

const indexFile = "index.ts";
const environmentRoot = ".";
const projectRoot = ".";
const ignoredDirectory = "node_modules";

interface Parent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly scopes: readonly string[];
  readonly structured: boolean;
}

function holdsFiles(directory: string): boolean {
  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    return (
      !entry.isDirectory() ||
      (entry.name !== ignoredDirectory &&
        holdsFiles(join(directory, entry.name)))
    );
  });
}

function listDirectories(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => {
      return (
        entry.isDirectory() &&
        entry.name !== ignoredDirectory &&
        holdsFiles(join(directory, entry.name))
      );
    })
    .map((entry) => entry.name)
    .sort();
}

function layerOf(name: string, layers: readonly string[] | undefined) {
  if (layers === undefined) {
    return;
  }

  const index = layers.indexOf(name);
  const fallback = layers.indexOf("*");

  return index === -1 ? (fallback === -1 ? undefined : fallback) : index;
}

function collect(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collect)];
}

function loosen(node: StructureNode): StructureNode {
  const children = node.children.map(loosen);

  return freeze({
    ...node,
    kind: node.kind === "unclassified" ? "domain" : node.kind,
    children,
  });
}

export function resolveEnvironmentStructure({
  name,
  root,
  dirs,
  options,
  roles,
  environmentRoles,
}: {
  name: StructureEnvironment;
  root: Directory;
  dirs: Directories;
  options: StructureOptions | undefined;
  roles: RolesOption | false | undefined;
  environmentRoles?: RolesOption | undefined;
}): EnvironmentStructure {
  const strictness = options?.strictness ?? "strict";
  const namespaces = options?.namespaces ?? {};
  const domains = entries(options?.domains ?? {});
  const optOut = new Set(options?.optOut);

  const rolesFor = memoized(
    (scopes: readonly string[]): ResolvedRoles => {
      return name === "bin"
        ? noRoles
        : resolveRoles({
            environment: name,
            roles,
            environmentRoles,
            scopes,
          });
    },
    (scopes) => scopes.join("\0"),
  );

  function roleOf(directory: string, parent: Parent): string | undefined {
    const { roles: contracts, aliases } = rolesFor(parent.scopes);
    const role = aliases[directory] ?? directory;

    return contracts[role] !== undefined && contracts[role].file === undefined
      ? role
      : undefined;
  }

  function describe(subpath: string, path: Directory) {
    const directory = subpath.slice(subpath.lastIndexOf("/") + 1);
    const namespace = namespaces[subpath];
    const exact = domains.find(([glob]) => glob === subpath)?.[1];

    const metadata: DomainDeclaration[] = [
      ...domains
        .filter(([glob]) => {
          return glob !== subpath && matchesGlob(subpath, glob);
        })
        .map(([, declared]) => declared),
      ...(exact === undefined ? [] : [exact]),
    ];

    if (namespace !== undefined && exact !== undefined) {
      throw new Error(
        `${path} is declared as a namespace and as a domain in the ${name} environment`,
      );
    }

    return {
      directory,
      namespace,
      exact,
      declared: metadata.length > 0,
      metadata: metadata.reduce<DomainDeclaration>((merged, declared) => {
        return { ...merged, ...declared };
      }, {}),
    };
  }

  function build(
    envDirectory: Directory,
    subpath: string,
    parent: Parent,
  ): StructureNode {
    const path = join(envDirectory, subpath);

    const { directory, namespace, exact, declared, metadata } = describe(
      subpath,
      path,
    );

    function node(
      kind: StructureKind,
      source: StructureNode["source"],
      extra: Partial<StructureNode>,
      {
        scopes = parent.scopes,
        structured = false,
        children,
      }: {
        scopes?: readonly string[];
        structured?: boolean;
        children?: readonly StructureNode[];
      } = {},
    ): StructureNode {
      const layer =
        kind === "role" ? undefined : layerOf(directory, parent.layers);

      return freeze({
        path,
        name: directory,
        kind,
        source,
        ...(layer === undefined ? {} : { layer }),
        ...extra,
        children:
          children ??
          walk(envDirectory, subpath, {
            kind,
            layers: extra.layers,
            scopes,
            structured,
          }),
      });
    }

    function domain(source: StructureNode["source"]) {
      return node("domain", source, {
        public: metadata.public ?? false,
        ...(metadata.specifier === undefined
          ? {}
          : { specifier: metadata.specifier }),
        ...(metadata.purpose === undefined
          ? {}
          : { purpose: metadata.purpose }),
      });
    }

    const role = roleOf(directory, parent);

    if (namespace !== undefined) {
      return node(
        "namespace",
        "config",
        {
          ...(namespace.layers === undefined
            ? {}
            : { layers: namespace.layers }),
          ...(namespace.prefix === undefined
            ? {}
            : { prefix: namespace.prefix }),
        },
        {
          scopes: [...parent.scopes, ...(namespace.roles?.enable ?? [])],
        },
      );
    }

    if (exact !== undefined) {
      return domain("config");
    }

    if (parent.kind === "role") {
      return role === undefined || !parent.structured
        ? node("unclassified", "inferred", {})
        : node("role", "inferred", { role });
    }

    if (
      role !== undefined &&
      parent.kind !== "namespace" &&
      !optOut.has(subpath)
    ) {
      const contained = rolesFor(parent.scopes).roles[role]?.roles;

      return node(
        "role",
        "inferred",
        {
          role,
        },
        {
          scopes: [...parent.scopes, ...(contained ?? [])],
          structured: contained !== undefined,
        },
      );
    }

    if (existsSync(join(root, path, indexFile))) {
      return domain("inferred");
    }

    if (declared) {
      return domain("config");
    }

    const probed = walk(envDirectory, subpath, {
      kind: "namespace",
      layers: undefined,
      scopes: parent.scopes,
      structured: false,
    });

    const holdsOnlyNamespacesAndDomains =
      probed.length > 0 &&
      probed.every(({ kind }) => {
        return kind === "domain" || kind === "namespace";
      });

    return holdsOnlyNamespacesAndDomains
      ? node("namespace", "inferred", {}, { children: probed })
      : node("unclassified", "inferred", {});
  }

  function walk(
    envDirectory: Directory,
    subpath: string,
    parent: Parent,
  ): StructureNode[] {
    if (parent.kind === "role" && !parent.structured) {
      return [];
    }

    const base = subpath === environmentRoot ? "" : `${subpath}/`;

    return listDirectories(join(root, envDirectory, subpath)).map(
      (directory) => {
        return build(envDirectory, `${base}${directory}`, parent);
      },
    );
  }

  const rootDeclaration = namespaces[environmentRoot];
  const rootScopes = rootDeclaration?.roles?.enable ?? [];

  // @debt the project root is never walked, so the tooling environment gets no structure tree until its directories exclude non-code folders
  const walked = dirs.filter((directory) => directory !== projectRoot);

  const children = flatMap(walked, (directory) => {
    return walk(directory, environmentRoot, {
      kind: "root",
      layers: rootDeclaration?.layers,
      scopes: rootScopes,
      structured: false,
    });
  });

  const resolvedRoot: StructureNode = freeze({
    path: environmentRoot,
    name,
    kind: "namespace",
    source: rootDeclaration === undefined ? "inferred" : "config",
    ...(rootDeclaration?.layers === undefined
      ? {}
      : { layers: rootDeclaration.layers }),
    ...(rootDeclaration?.prefix === undefined
      ? {}
      : { prefix: rootDeclaration.prefix }),
    children,
  });

  const tree = strictness === "loose" ? loosen(resolvedRoot) : resolvedRoot;

  return freeze({
    name,
    dirs,
    strictness,
    root: tree,
    unclassified: collect(tree).filter(({ kind }) => kind === "unclassified"),
  });
}
