import { readdir } from "node:fs/promises";
import { join, matchesGlob } from "node:path";

import { flat, flatMap, wrap } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze, record, values } from "@auaust/toolkit/object";

import { pathExists } from "#foundation/filesystem/index";
import { noRoles } from "#project/structure/constants";
import { getEntryFile } from "#project/structure/utils/getEntryFile";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { getLocalRoleName } from "#project/structure/utils/getLocalRoleName";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureMirror } from "#project/structure/types/StructureMirror";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { StructureRole } from "#project/structure/types/StructureRole";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { UnclassifiedReason } from "#project/structure/types/UnclassifiedReason";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

type DomainDeclaration = StructureOptions["domains"][string];

const environmentRoot = ".";
const projectRoot = ".";
const ignoredDirectory = "node_modules";
const anyFile: Glob = "**";

interface Parent {
  readonly kind: StructureKind | "root";
  readonly layers: readonly string[] | undefined;
  readonly scopes: readonly string[];
  readonly owned: readonly string[];
  readonly structured: boolean;
  readonly mirrored?: {
    readonly environment: StructureEnvironmentName;
    readonly subpath: string;
  };
}

async function holdsFiles(directory: string): Promise<boolean> {
  const entries = await readdir(directory, { withFileTypes: true });

  const holds = await Promise.all(
    entries.map(async (entry) => {
      return (
        !entry.isDirectory() ||
        (entry.name !== ignoredDirectory &&
          (await holdsFiles(join(directory, entry.name))))
      );
    }),
  );

  return holds.some(Boolean);
}

async function listDirectories(directory: string): Promise<string[]> {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });

  const listed = await Promise.all(
    entries.map(async (entry) => {
      return (
        entry.isDirectory() &&
        entry.name !== ignoredDirectory &&
        (await holdsFiles(join(directory, entry.name)))
      );
    }),
  );

  return entries
    .filter((_, index) => listed[index])
    .map((entry) => entry.name)
    .sort();
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
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
  readonly counterpart?: StructureNode;
}

function createMirrorClassifier(tests: TestsContext) {
  const counterparts = memoized(
    (
      environment: StructureEnvironmentName,
    ): ReadonlyMap<string, StructureNode> => {
      const structure = tests.environments[environment]?.structure;

      return new Map(
        structure === undefined
          ? []
          : collect(structure.root).map((node) => [node.path, node]),
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

    const counterpart =
      path === undefined ? undefined : counterparts(environment).get(path);

    return path === undefined
      ? { kind: "unclassified", reason: "missing counterpart" }
      : {
          kind: "mirror",
          mirror: { environment, path },
          mirrored: { environment, subpath },
          ...(counterpart === undefined ? {} : { counterpart }),
        };
  };
}

function listRoles(
  root: StructureNode,
  rootFiles: readonly { directory: Directory; roles: ResolvedRoles }[],
  rolesIn: ReadonlyMap<StructureNode, ResolvedRoles>,
): Readonly<Record<string, StructureRole>> {
  const files = new Map<string, Set<Glob>>();
  const ignores = new Map<string, Set<Glob>>();
  const contracts = new Map<string, StructureRole["contract"]>();

  function add(
    target: Map<string, Set<Glob>>,
    role: string,
    globs: readonly Glob[],
  ) {
    const set = target.get(role) ?? new Set();

    for (const glob of globs) {
      set.add(glob);
    }

    target.set(role, set);
  }

  function addFileRoles(directory: Directory, roles: ResolvedRoles) {
    for (const [name, contract] of entries(roles.roles)) {
      if (contract.file === undefined) {
        continue;
      }

      contracts.set(name, contract);

      add(
        files,
        name,
        wrap(contract.file).map((glob) => join(directory, glob)),
      );
    }
  }

  function visit(node: StructureNode) {
    const roles = rolesIn.get(node);

    const contract =
      node.role === undefined ? undefined : roles?.roles[node.role];

    if (node.role !== undefined && contract !== undefined) {
      contracts.set(node.role, contract);
      add(files, node.role, [join(node.path, anyFile)]);

      add(
        ignores,
        node.role,
        node.children.map((child) => join(child.path, anyFile)),
      );

      for (const name of contract.roles ?? []) {
        const nested = roles?.roles[name];

        if (nested?.file === undefined) {
          continue;
        }

        const globs = wrap(nested.file).map((glob) => join(node.path, glob));

        contracts.set(name, nested);
        add(files, name, globs);
        add(ignores, node.role, globs);
      }
    } else if (node.kind !== "role" && roles !== undefined) {
      addFileRoles(node.path, roles);
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const { directory, roles } of rootFiles) {
    addFileRoles(directory, roles);
  }

  for (const child of root.children) {
    visit(child);
  }

  return freeze(
    record(
      [...contracts].map(([name, contract]) => {
        return [
          name,
          freeze({
            contract,
            files: freeze([...(files.get(name) ?? [])]),
            ignores: freeze([...(ignores.get(name) ?? [])]),
          }),
        ] as const;
      }),
    ),
  );
}

export async function resolveEnvironmentStructure({
  name,
  root,
  dirs,
  options,
  roles,
  defined,
  tests,
  layout,
}: {
  name: StructureEnvironmentName;
  root: Directory;
  dirs: Directories;
  options: StructureOptions;
  roles?: EnvironmentRoles | undefined;
  defined?: RoleRegistry;
  tests?: TestsContext;
  layout?: ProgramLayout | undefined;
}): Promise<EnvironmentStructure> {
  const { strictness, namespaces } = options;
  const domains = entries(options.domains);
  const optOut = new Set(options.optOut);
  const commands = layout === "commands";

  const classifyMirror =
    tests === undefined ? undefined : createMirrorClassifier(tests);

  const rolesFor = memoized(
    (scopes: readonly string[]): ResolvedRoles => {
      return name === "bin" || roles === undefined
        ? noRoles
        : resolveRoles({
            ...roles,
            environment: name,
            ...(defined === undefined ? {} : { defined }),
            scopes,
          });
    },
    (scopes) => scopes.join("\0"),
  );

  const rolesIn = new Map<StructureNode, ResolvedRoles>();

  const indexFile = getIndexFile(rolesFor([]));
  const entryFile = getEntryFile(rolesFor([]));

  function roleOf(directory: string, parent: Parent): string | undefined {
    const { roles: contracts, aliases } = rolesFor(parent.scopes);
    const local = aliases[directory] ?? directory;

    const role = [
      ...parent.owned.filter((owned) => getLocalRoleName(owned) === local),
      local,
    ].find((candidate) => contracts[candidate] !== undefined);

    return role !== undefined && contracts[role]?.file === undefined
      ? role
      : undefined;
  }

  function metadataOf(role: string, scopes: readonly string[]) {
    const purpose = rolesFor(scopes).roles[role]?.purpose;

    const effects = rolesFor(scopes).roles[role]?.effects;

    return {
      ...(purpose === undefined ? {} : { purpose }),
      ...(effects === undefined ? {} : { effects }),
    };
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

  async function build(
    envDirectory: Directory,
    subpath: string,
    parent: Parent,
  ): Promise<StructureNode> {
    const path = join(envDirectory, subpath);

    const { directory, namespace, exact, declared, metadata } = describe(
      subpath,
      path,
    );

    async function node(
      kind: StructureKind,
      source: StructureNode["source"],
      extra: Partial<StructureNode>,
      {
        scopes = parent.scopes,
        owned = parent.owned,
        structured = false,
        mirrored,
        children,
      }: {
        scopes?: readonly string[];
        owned?: readonly string[];
        structured?: boolean;
        mirrored?: Parent["mirrored"];
        children?: readonly StructureNode[];
      } = {},
    ): Promise<StructureNode> {
      const layer =
        kind === "role" ? undefined : layerOf(directory, parent.layers);

      const built: StructureNode = freeze({
        path,
        name: directory,
        kind,
        source,
        ...(layer === undefined ? {} : { layer }),
        ...extra,
        children:
          children ??
          (await walk(envDirectory, subpath, {
            kind,
            layers: extra.layers,
            scopes,
            owned,
            structured,
            ...(mirrored === undefined ? {} : { mirrored }),
          })),
      });

      rolesIn.set(built, rolesFor(scopes));

      return built;
    }

    async function domain(source: StructureNode["source"]) {
      const { roles: contracts } = rolesFor(parent.scopes);

      const fileGlobs = values(contracts).flatMap(({ file }) => {
        return file === undefined ? [] : [file].flat();
      });

      const files =
        commands || fileGlobs.length === 0
          ? []
          : await listFiles(join(root, path));

      const strays = files.filter((file) => {
        return !fileGlobs.some((glob) => matchesGlob(file, glob));
      });

      return node("domain", source, {
        ...(commands ? { commands: true as const } : {}),
        ...(strays.length === 0
          ? {}
          : { strays: strays.map((file) => join(path, file)) }),
        public:
          entryFile !== undefined &&
          (await pathExists(join(root, path, entryFile))),
        ...(metadata.specifier === undefined
          ? {}
          : { specifier: metadata.specifier }),
        ...(metadata.purpose === undefined
          ? {}
          : { purpose: metadata.purpose }),
      });
    }

    const mirrorClass =
      classifyMirror === undefined || declared || parent.kind === "role"
        ? undefined
        : classifyMirror(directory, parent);

    const role =
      parent.mirrored === undefined ||
      mirrorClass === undefined ||
      mirrorClass.counterpart?.kind === "role"
        ? roleOf(directory, parent)
        : undefined;

    if (namespace !== undefined) {
      return node(
        "namespace",
        "config",
        {
          ...(namespace.layers === undefined
            ? {}
            : { layers: namespace.layers }),
          relation: namespace.relation,
          ...(namespace.purpose === undefined
            ? {}
            : { purpose: namespace.purpose }),
        },
        {
          scopes: [...parent.scopes, ...namespace.roles.enable],
          owned: [...namespace.roles.enable, ...parent.owned],
        },
      );
    }

    if (exact !== undefined) {
      return domain("config");
    }

    if (parent.kind === "role") {
      return role === undefined || !parent.structured
        ? node("unclassified", "inferred", {})
        : node("role", "inferred", {
            role,
            ...metadataOf(role, parent.scopes),
          });
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
          ...metadataOf(role, parent.scopes),
        },
        {
          scopes: [...parent.scopes, ...(contained ?? [])],
          owned: [...(contained ?? []), ...parent.owned],
          structured: contained !== undefined,
        },
      );
    }

    if (mirrorClass !== undefined) {
      const { kind, mirror, reason, mirrored } = mirrorClass;

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

    if (commands || (await pathExists(join(root, path, indexFile)))) {
      return domain("inferred");
    }

    if (declared) {
      return domain("config");
    }

    const probed = await walk(envDirectory, subpath, {
      kind: "namespace",
      layers: undefined,
      scopes: parent.scopes,
      owned: parent.owned,
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

  async function walk(
    envDirectory: Directory,
    subpath: string,
    parent: Parent,
  ): Promise<StructureNode[]> {
    if (parent.kind === "role" && !parent.structured) {
      return [];
    }

    const base = subpath === environmentRoot ? "" : `${subpath}/`;

    const directories = await listDirectories(
      join(root, envDirectory, subpath),
    );

    return Promise.all(
      directories.map((directory) => {
        return build(envDirectory, `${base}${directory}`, parent);
      }),
    );
  }

  const rootDeclaration = namespaces[environmentRoot];
  const rootScopes = rootDeclaration?.roles.enable ?? [];

  const walked = dirs.filter((directory) => directory !== projectRoot);

  const children = flat(
    await Promise.all(
      walked.map((directory) => {
        return walk(directory, environmentRoot, {
          kind: "root",
          layers: rootDeclaration?.layers,
          scopes: rootScopes,
          owned: rootScopes,
          structured: false,
        });
      }),
    ),
  );

  const resolvedRoot: StructureNode = freeze({
    path: environmentRoot,
    name,
    kind: "namespace",
    source: rootDeclaration === undefined ? "inferred" : "config",
    ...(commands ? { commands: true as const } : {}),
    ...(rootDeclaration?.layers === undefined
      ? {}
      : { layers: rootDeclaration.layers }),
    ...(rootDeclaration === undefined
      ? {}
      : { relation: rootDeclaration.relation }),
    ...(rootDeclaration?.purpose === undefined
      ? {}
      : { purpose: rootDeclaration.purpose }),
    children,
  });

  const structureRoles = listRoles(
    resolvedRoot,
    walked.map((directory) => {
      return { directory, roles: rolesFor(rootScopes) };
    }),
    rolesIn,
  );

  const tree =
    strictness === "loose"
      ? loosen(resolvedRoot, name === "tests" ? "mirror" : "domain")
      : resolvedRoot;

  return freeze({
    name,
    dirs,
    indexFile,
    entryFile,
    strictness,
    root: tree,
    unclassified: collect(tree).filter(({ kind }) => kind === "unclassified"),
    roles: structureRoles,
  });
}
