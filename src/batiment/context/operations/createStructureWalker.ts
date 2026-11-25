import { join } from "node:path";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { listStructureDirectories } from "#batiment/context/operations/listStructureDirectories";
import {
  extendRoleLocation,
  getStructureLayer,
  type createMirrorClassifier,
  type StaticLayout,
  type StructureKind,
  type StructureNode,
  type StructureOptions,
  type StructureParent,
} from "#batiment/structure/index";
import type { createStructureDomainResolver } from "#batiment/context/operations/createStructureDomainResolver";
import type { createStructureRoleResolver } from "#batiment/context/operations/createStructureRoleResolver";
import type { ResolvedRoles, RoleLocation } from "#batiment/roles/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const namespaceRoot = ".";

export function createStructureWalker({
  filesystem,
  options,
  group,
  layoutEntries,
  indexFile,
  rolesIn,
  roleResolver,
  domainResolver,
  classifyMirror,
  stops,
}: {
  filesystem: Filesystem;
  options: StructureOptions;
  group: boolean;
  layoutEntries: StaticLayout["entries"] | undefined;
  indexFile: File;
  rolesIn: Map<StructureNode, ResolvedRoles>;
  roleResolver: ReturnType<typeof createStructureRoleResolver>;
  domainResolver: ReturnType<typeof createStructureDomainResolver>;
  classifyMirror: ReturnType<typeof createMirrorClassifier> | undefined;
  stops: Directories;
}) {
  const optOut = new Set(options.optOut);

  const {
    rolesFor,
    roleOf,
    metadataOf,
    resolveFileNames,
    roleCardinality,
  } = roleResolver;

  const { describe, metadataForDomain } = domainResolver;

  async function build(
    envDirectory: Directory,
    subpath: string,
    parent: StructureParent,
  ): Promise<StructureNode> {
    const path = join(envDirectory, subpath);

    const {
      directory,
      namespace,
      exact,
      declared,
      metadata,
    } = describe(subpath);

    function locate(kind: StructureKind, role?: string): RoleLocation {
      return extendRoleLocation(parent.location, {
        kind,
        name: directory,
        path,
        ...(role === undefined ? {} : { role }),
      });
    }

    async function node(
      kind: StructureKind,
      source: StructureNode["source"],
      extra: Partial<StructureNode>,
      {
        scopes = parent.scopes,
        owned = parent.owned,
        structured = false,
        location = locate(kind, extra.role),
        mirrored,
        children,
      }: {
        scopes?: readonly string[];
        owned?: readonly string[];
        structured?: boolean;
        location?: RoleLocation;
        mirrored?: StructureParent["mirrored"];
        children?: readonly StructureNode[];
      } = {},
    ): Promise<StructureNode> {
      const layer = kind === "role"
        ? undefined
        : getStructureLayer(directory, parent.layers);

      const built: StructureNode = freeze({
        path,
        name: directory,
        kind,
        source,
        ...(layer === undefined ? {} : { layer }),
        ...extra,
        children: (
          children ??
          (await walk(envDirectory, subpath, {
            kind,
            layers: extra.layers,
            ...(extra.childKind === undefined
              ? {}
              : { childKind: extra.childKind }),
            scopes,
            owned,
            structured,
            source,
            location,
            ...(mirrored === undefined ? {} : { mirrored }),
          }))
        ),
      });

      rolesIn.set(built, rolesFor(scopes));

      return built;
    }

    async function domain(source: StructureNode["source"]) {
      return node(
        "domain",
        source,
        await metadataForDomain(path, parent.scopes, metadata),
      );
    }

    const layoutEntry = parent.kind === "root" && layoutEntries !== undefined
      ? { listed: getOwn(layoutEntries, directory) }
      : undefined;

    if (layoutEntry !== undefined && layoutEntry.listed === undefined) {
      return node("unclassified", "inferred", {}, { children: [] });
    }

    if (namespace !== undefined) {
      return node(
        "namespace",
        namespace.source,
        {
          ...(namespace.layers === undefined
            ? {}
            : { layers: namespace.layers }),
          relation: namespace.relation,
          ...(namespace.children === undefined
            ? {}
            : { childKind: namespace.children }),
          ...(namespace.purpose === undefined
            ? {}
            : { purpose: namespace.purpose }),
          ...(namespace.debt === undefined ? {} : { debt: namespace.debt }),
        },
        {
          scopes: [...parent.scopes, ...namespace.roles.enable],
          owned: [...namespace.roles.enable, ...parent.owned],
        },
      );
    }

    const mirrorClass = (
      classifyMirror === undefined ||
      declared !== undefined ||
      parent.kind === "role"
    )
      ? undefined
      : classifyMirror(directory, parent);

    const inferredRole = (
      parent.mirrored === undefined ||
      mirrorClass === undefined ||
      mirrorClass.counterpart?.kind === "role"
    )
      ? roleOf(directory, parent)
      : undefined;

    const role = layoutEntry === undefined
      ? inferredRole
      : layoutEntry.listed?.role;

    if (layoutEntry !== undefined && role === undefined) {
      return node("namespace", "inferred", {});
    }

    if (exact !== undefined) {
      return domain(exact.source);
    }

    if (parent.kind === "role") {
      return role === undefined || !parent.structured
        ? node("unclassified", "inferred", {})
        : node("role", "inferred", {
            role,
            ...metadataOf(role, parent.scopes),
            ...(await roleCardinality(path, role, {
              scopes: parent.scopes,
              structured: false,
            })),
          });
    }

    if (
      role !== undefined &&
      parent.kind !== "namespace" &&
      !optOut.has(subpath)
    ) {
      const contained = rolesFor(parent.scopes).roles[role]?.roles;
      const scopes = [...parent.scopes, ...(contained ?? [])];
      const structured = contained !== undefined;
      const location = locate("role", role);

      const { fileNames } = resolveFileNames(role, scopes, location);

      return node(
        "role",
        "inferred",
        {
          role,
          ...metadataOf(role, parent.scopes),
          ...(fileNames === undefined ? {} : { fileNames }),
          ...(await roleCardinality(path, role, {
            scopes,
            structured,
            fileNames,
          })),
        },
        {
          scopes,
          owned: [...(contained ?? []), ...parent.owned],
          structured,
          location,
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

    if (group || (await filesystem.exists(join(path, indexFile)))) {
      return domain("inferred");
    }

    if (declared !== undefined || parent.childKind === "domains") {
      return domain(declared ?? parent.source);
    }

    const probed = await walk(envDirectory, subpath, {
      kind: "namespace",
      layers: undefined,
      scopes: parent.scopes,
      owned: parent.owned,
      structured: false,
      source: "inferred",
      location: locate("namespace"),
    });

    const holdsOnlyNamespacesAndDomains = (
      probed.length > 0 &&
      probed.every(({ kind }) => {
        return kind === "domain" || kind === "namespace";
      })
    );

    return holdsOnlyNamespacesAndDomains
      ? node("namespace", "inferred", {}, { children: probed })
      : node("unclassified", "inferred", {});
  }

  async function walk(
    envDirectory: Directory,
    subpath: string,
    parent: StructureParent,
  ): Promise<StructureNode[]> {
    if (parent.kind === "role" && !parent.structured) {
      return [];
    }

    const base = subpath === namespaceRoot ? "" : `${subpath}/`;

    const directories = await listStructureDirectories(
      filesystem,
      join(envDirectory, subpath),
      stops,
    );

    return Promise.all(
      directories.map((directory) => {
        return build(envDirectory, `${base}${directory}`, parent);
      }),
    );
  }

  return walk;
}
