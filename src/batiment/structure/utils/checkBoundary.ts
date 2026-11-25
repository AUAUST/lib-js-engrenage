import { min } from "@auaust/toolkit/math";
import { freeze } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
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

// @debt the entity index builds one root member per directory of a namespace, so lineage identity holds only below the root and callers must first match the namespaces
function divergenceBelowRoot(
  importer: readonly LineageMember[],
  target: readonly LineageMember[],
): number {
  const shared = min(importer.length, target.length);

  for (let index = 1; index < shared; index++) {
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

  if (
    targetOwner === undefined ||
    (target.lineage.length === 1
      ? isIndexOrEntry(target)
      : targetOwner.kind !== "domain")
  ) {
    return;
  }

  if (target.lineage.length > 1 && !target.public) {
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
  const atRoot = importerLineage.length === 1;
  const global = targetLineage.length === 1;

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

  function reachPeer(split: number): BoundaryViolation | undefined {
    const container = importerLineage[split - 1];
    const from = importerLineage[split];
    const to = targetLineage[split];

    if (container === undefined || from === undefined || to === undefined) {
      return;
    }

    if (container.layers !== undefined) {
      if (
        from.layer === undefined ||
        to.layer === undefined ||
        to.layer > from.layer
      ) {
        return violation("higherLayer", container);
      }

      if (to.layer < from.layer) {
        return reachSurface(split);
      }
    }

    return container.isolated
      ? violation("isolatedPeer", container)
      : reachSurface(split);
  }

  function decide(
    domain: LineageMember,
    targetDomain: LineageMember,
  ): BoundaryViolation | undefined {
    if (atRoot) {
      if (importer.kind === "role") {
        if (global) {
          return;
        }

        return kind === "type"
          ? reachSurface(divergenceBelowRoot(importerLineage, targetLineage))
          : violation("globalRole");
      }

      return global || target.public ? undefined : privateTo(targetDomain);
    }

    const split = divergenceBelowRoot(importerLineage, targetLineage);
    const within = split === targetLineage.length;

    if (importer.kind === "domain" && importer.role === entryRoleName) {
      if (within && targetDomain === domain) {
        return isOnSurface(target) ? undefined : privateTo(domain);
      }

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
