import { min } from "@auaust/toolkit/math";
import { freeze } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { checkPeerOrder } from "#batiment/structure/utils/checkPeerOrder";
import { getLineageDirectory } from "#batiment/structure/utils/getLineageDirectory";
import type { BoundaryCause } from "#batiment/structure/types/BoundaryCause";
import type { BoundaryViolation } from "#batiment/structure/types/BoundaryViolation";
import type { Entity } from "#batiment/structure/types/Entity";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";
import type { ImportKind } from "#batiment/structure/types/ImportKind";
import type { LineageMember } from "#batiment/structure/types/LineageMember";

function isIndexOrEntry({ kind, role }: Entity): boolean {
  return kind !== "role" && (role === indexRoleName || role === entryRoleName);
}

function isOnSurface({ public: exposed, role }: Entity): boolean {
  return exposed && role !== entryRoleName;
}

function isAtDirectoryRoot({ lineage }: Entity): boolean {
  const directory = getLineageDirectory(lineage);

  return directory !== undefined && lineage.at(-1) === directory;
}

function divergence(
  importer: readonly LineageMember[],
  target: readonly LineageMember[],
): number {
  const shared = min(importer.length, target.length);

  for (let index = 0; index < shared; index++) {
    if (importer[index] !== target[index]) {
      return index;
    }
  }

  return shared;
}

function violation(
  cause: BoundaryCause,
  boundary?: LineageMember,
  fix?: string,
): BoundaryViolation {
  return freeze({
    cause,
    boundary,
    fix,
  });
}

// @debt the fix reads the domain's index specifier as the first entry of its surface, which holds only while an alias covers the index
function privateRole(
  exposer: LineageMember,
  target: Entity,
): BoundaryViolation {
  return violation(
    "privateRole",
    exposer,
    exposer === target.lineage.at(-1) ? target.surface[0] : undefined,
  );
}

function typeOnly(
  importer: Entity,
  kind: ImportKind,
): BoundaryViolation | undefined {
  return importer.contract?.typeOnly === true && kind === "runtime"
    ? violation("typeOnly")
    : undefined;
}

function checkConsumerReach(
  importer: Entity,
  target: Entity,
  kind: ImportKind,
): BoundaryViolation | undefined {
  const targetOwner = target.lineage.at(-1);
  const global = isAtDirectoryRoot(target);

  if (
    targetOwner === undefined ||
    (global ? isIndexOrEntry(target) : targetOwner.kind !== "domain")
  ) {
    return;
  }

  if (!global && !target.public) {
    return privateRole(targetOwner, target);
  }

  return typeOnly(importer, kind);
}

export function checkBoundary(
  importer: Entity,
  target: Entity,
  kind: ImportKind,
  { elements, surface }: ImportGrants,
): BoundaryViolation | undefined {
  const { namespace } = importer;

  if (namespace === undefined) {
    return;
  }

  if (
    target.namespace !== undefined &&
    surface[namespace]?.includes(target.namespace) === true
  ) {
    return checkConsumerReach(importer, target, kind);
  }

  const importerLineage = importer.lineage;
  const targetLineage = target.lineage;
  const owner = importerLineage.at(-1);
  const targetOwner = targetLineage.at(-1);
  const atRoot = isAtDirectoryRoot(importer);
  const global = isAtDirectoryRoot(target);

  // @debt a file at an environment root outside the global roles and the root entry is never checked
  if (
    !elements.includes(namespace) ||
    target.namespace !== namespace ||
    owner === undefined ||
    targetOwner === undefined ||
    (global ? isIndexOrEntry(target) : targetOwner.kind !== "domain") ||
    (atRoot
      ? importer.kind !== "role" && !isIndexOrEntry(importer)
      : owner.kind !== "domain")
  ) {
    return;
  }

  function privateTo(exposer: LineageMember): BoundaryViolation {
    return privateRole(exposer, target);
  }

  function reachSurface(split: number): BoundaryViolation | undefined {
    const exposer = targetLineage.slice(split).find((member) => {
      return member.kind === "domain";
    });

    if (
      exposer === undefined ||
      ((exposer === targetOwner ||
        target.contract?.collected === true ||
        target.contract?.surface === "modules") &&
        isOnSurface(target))
    ) {
      return;
    }

    return privateTo(exposer);
  }

  function reachPeer(
    split: number,
    reach = () => reachSurface(split),
  ): BoundaryViolation | undefined {
    const container = importerLineage[split - 1];
    const from = importerLineage[split];
    const to = targetLineage[split];

    if (container === undefined || from === undefined || to === undefined) {
      return;
    }

    const cause = checkPeerOrder(container, from, to);

    return cause === undefined ? reach() : violation(cause, container);
  }

  function acrossDirectories(
    reach: () => BoundaryViolation | undefined,
  ): BoundaryViolation | undefined {
    const split = divergence(importerLineage, targetLineage);

    return importerLineage[split]?.kind === "directory"
      ? reachPeer(split, reach)
      : reach();
  }

  function decide(
    domain: LineageMember,
    targetDomain: LineageMember,
  ): BoundaryViolation | undefined {
    if (atRoot) {
      return acrossDirectories(() => {
        if (importer.kind === "role") {
          if (global) {
            return;
          }

          return kind === "type"
            ? reachSurface(divergence(importerLineage, targetLineage))
            : violation("globalRole");
        }

        return global || target.public ? undefined : privateTo(targetDomain);
      });
    }

    const split = divergence(importerLineage, targetLineage);
    const within = split === targetLineage.length;

    if (importer.kind === "domain" && importer.role === entryRoleName) {
      if (within && targetDomain === domain) {
        return isOnSurface(target) ? undefined : privateTo(domain);
      }

      // @debt an entry collects a role from every domain past layers and directory order, so a lower directory's entry re-exports a higher directory's modules
      if (
        target.role !== undefined &&
        importer.collects.includes(target.role) &&
        target.public
      ) {
        return;
      }

      return violation("entrySurface");
    }

    if (within) {
      return target.kind === "domain" && isIndexOrEntry(target)
        ? violation("ownIndex")
        : undefined;
    }

    return split < importerLineage.length
      ? reachPeer(split)
      : reachSurface(split);
  }

  const denied = decide(owner, targetOwner);

  if (denied !== undefined) {
    return denied;
  }

  return typeOnly(importer, kind);
}
