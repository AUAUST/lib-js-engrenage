import { join } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { listStructureDirectories } from "#project/structure/operations/listStructureDirectories";
import { extendRoleLocation } from "#project/structure/utils/extendRoleLocation";
import { getStructureLayer } from "#project/structure/utils/getStructureLayer";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RoleLocation } from "#project/roles/index";
import type { createStructureDomainResolver } from "#project/structure/operations/createStructureDomainResolver";
import type { createStructureRoleResolver } from "#project/structure/operations/createStructureRoleResolver";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { StructureParent } from "#project/structure/types/StructureParent";
import type { createMirrorClassifier } from "#project/structure/utils/createMirrorClassifier";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const environmentRoot = ".";

export function createStructureWalker({
  filesystem,
  options,
  commands,
  indexFile,
  rolesIn,
  roleResolver,
  domainResolver,
  classifyMirror,
}: {
  filesystem: Filesystem;
  options: StructureOptions;
  commands: boolean;
  indexFile: File;
  rolesIn: Map<StructureNode, ResolvedRoles>;
  roleResolver: ReturnType<typeof createStructureRoleResolver>;
  domainResolver: ReturnType<typeof createStructureDomainResolver>;
  classifyMirror: ReturnType<typeof createMirrorClassifier> | undefined;
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

    const mirrorClass = (
      classifyMirror === undefined || declared || parent.kind === "role"
    )
      ? undefined
      : classifyMirror(directory, parent);

    const role = (
      parent.mirrored === undefined ||
      mirrorClass === undefined ||
      mirrorClass.counterpart?.kind === "role"
    )
      ? roleOf(directory, parent)
      : undefined;

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
        },
        {
          scopes: [...parent.scopes, ...namespace.roles.enable],
          owned: [...namespace.roles.enable, ...parent.owned],
        },
      );
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

    if (commands || (await filesystem.exists(join(path, indexFile)))) {
      return domain("inferred");
    }

    if (declared || parent.childKind === "domains") {
      return domain("config");
    }

    const probed = await walk(envDirectory, subpath, {
      kind: "namespace",
      layers: undefined,
      scopes: parent.scopes,
      owned: parent.owned,
      structured: false,
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

    const base = subpath === environmentRoot ? "" : `${subpath}/`;

    const directories = await listStructureDirectories(
      filesystem,
      join(envDirectory, subpath),
    );

    return Promise.all(
      directories.map((directory) => {
        return build(envDirectory, `${base}${directory}`, parent);
      }),
    );
  }

  return walk;
}
