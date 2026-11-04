import { existsSync, readdirSync } from "node:fs";
import { join, matchesGlob } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze, values } from "@auaust/toolkit/object";

import { noRoles } from "#project/structure/constants";
import { resolveRoles } from "#project/structure/operations/resolveRoles";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProjectRoles } from "#project/structure/types/ProjectRoles";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RolesOption } from "#project/structure/types/RolesOption";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureMirror } from "#project/structure/types/StructureMirror";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { UnclassifiedReason } from "#project/structure/types/UnclassifiedReason";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

type DomainDeclaration = StructureOptions["domains"][string];

const indexFile = "index.ts";
const environmentRoot = ".";
const projectRoot = ".";
const ignoredDirectory = "node_modules";

interface Parent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly scopes: readonly string[];
  readonly structured: boolean;
  readonly mirrored?: {
    readonly environment: StructureEnvironmentName;
    readonly subpath: string;
  };
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

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.isDirectory())
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

function loosen(
  node: StructureNode,
  unclassified: StructureKind,
): StructureNode {
  const children = node.children.map((child) => loosen(child, unclassified));

  if (node.kind !== "unclassified") {
    return freeze({ ...node, children });
  }

  return freeze({
    path: node.path,
    name: node.name,
    kind: unclassified,
    source: node.source,
    ...(node.layer === undefined ? {} : { layer: node.layer }),
    children,
  });
}

interface Mirror {
  readonly kind: StructureKind;
  readonly mirror?: StructureMirror;
  readonly reason?: UnclassifiedReason;
  readonly mirrored?: NonNullable<Parent["mirrored"]>;
}

function createMirrorClassifier(tests: TestsContext) {
  const counterparts = memoized(
    (environment: StructureEnvironmentName): ReadonlySet<string> => {
      const structure = tests.environments[environment]?.structure;

      return new Set(
        structure === undefined
          ? []
          : collect(structure.root).map(({ path }) => path),
      );
    },
  );

  return function classify(directory: string, parent: Parent): Mirror {
    const unknown = {
      kind: "unclassified",
      reason: "unknown root key",
    } as const;

    if (parent.kind === "root") {
      const root = entries(tests.environments).find(
        ([key]) => key === directory,
      );

      return root?.[1] === undefined
        ? unknown
        : {
            kind: "mirror",
            mirror: {
              environment: root[0],
              path: root[1].dirs[0] ?? root[0],
            },
            mirrored: { environment: root[0], subpath: "" },
          };
    }

    if (parent.mirrored === undefined) {
      return unknown;
    }

    const { environment } = parent.mirrored;
    const subpath = join(parent.mirrored.subpath, directory);
    const dirs = tests.environments[environment]?.dirs ?? [];

    const path =
      tests.layout === "roots"
        ? join(dirs[0] ?? environment, subpath)
        : dirs
            .map((dir) => join(dir, subpath))
            .find((candidate) => counterparts(environment).has(candidate));

    return path === undefined
      ? { kind: "unclassified", reason: "missing counterpart" }
      : {
          kind: "mirror",
          mirror: { environment, path },
          mirrored: { environment, subpath },
        };
  };
}

export function resolveEnvironmentStructure({
  name,
  root,
  dirs,
  options,
  roles,
  environmentRoles,
  tests,
}: {
  name: StructureEnvironmentName;
  root: Directory;
  dirs: Directories;
  options: StructureOptions;
  roles: ProjectRoles;
  environmentRoles?: RolesOption | undefined;
  tests?: TestsContext;
}): EnvironmentStructure {
  // @debt the public default applies after the glob metadata merge, which needs the declarations to keep unset fields, so it cannot live in the declaration
  const { strictness, namespaces } = options;
  const domains = entries(options.domains);
  const optOut = new Set(options.optOut);

  const classifyMirror =
    tests === undefined ? undefined : createMirrorClassifier(tests);

  const rolesFor = memoized(
    (scopes: readonly string[]): ResolvedRoles => {
      return name === "bin" || environmentRoles === undefined
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
      metadata: metadata.reduce<Partial<DomainDeclaration>>(
        (merged, declared) => {
          return { ...merged, ...declared };
        },
        {},
      ),
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
        mirrored,
        children,
      }: {
        scopes?: readonly string[];
        structured?: boolean;
        mirrored?: Parent["mirrored"];
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
            ...(mirrored === undefined ? {} : { mirrored }),
          }),
      });
    }

    function domain(source: StructureNode["source"]) {
      const { roles: contracts } = rolesFor(parent.scopes);

      const fileGlobs = values(contracts).flatMap(({ file }) => {
        return file === undefined ? [] : [file].flat();
      });

      const strays =
        fileGlobs.length === 0
          ? []
          : listFiles(join(root, path)).filter((file) => {
              return !fileGlobs.some((glob) => matchesGlob(file, glob));
            });

      return node("domain", source, {
        ...(strays.length === 0
          ? {}
          : { strays: strays.map((file) => join(path, file)) }),
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
        },
        {
          scopes: [...parent.scopes, ...namespace.roles.enable],
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

    if (classifyMirror !== undefined && !declared) {
      const { kind, mirror, reason, mirrored } = classifyMirror(
        directory,
        parent,
      );

      return node(
        kind,
        "inferred",
        {
          ...(mirror === undefined ? {} : { mirror }),
          ...(reason === undefined ? {} : { reason }),
        },
        {
          ...(mirrored === undefined ? {} : { mirrored }),
          ...(kind === "unclassified" ? { children: [] } : {}),
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
  const rootScopes = rootDeclaration?.roles.enable ?? [];

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
    children,
  });

  const tree =
    strictness === "loose"
      ? loosen(resolvedRoot, name === "tests" ? "mirror" : "domain")
      : resolvedRoot;

  return freeze({
    name,
    dirs,
    strictness,
    root: tree,
    unclassified: collect(tree).filter(({ kind }) => kind === "unclassified"),
  });
}
