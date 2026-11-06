import { min } from "@auaust/toolkit/math";
import { freeze } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { elementEnvironments } from "#project/structure/constants";
import type { BoundaryCause } from "#project/structure/types/BoundaryCause";
import type { BoundaryViolation } from "#project/structure/types/BoundaryViolation";
import type { Entity } from "#project/structure/types/Entity";
import type { ImportKind } from "#project/structure/types/ImportKind";
import type { LineageMember } from "#project/structure/types/LineageMember";

function isIndexOrEntry({ kind, role }: Entity): boolean {
  return kind !== "role" && (role === indexRoleName || role === entryRoleName);
}

function isOnSurface({ public: exposed, role }: Entity): boolean {
  return exposed && role !== entryRoleName;
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

export function checkBoundary(
  importer: Entity,
  target: Entity,
  kind: ImportKind,
): BoundaryViolation | undefined {
  const importerLineage = importer.lineage;
  const targetLineage = target.lineage;
  const owner = importerLineage.at(-1);
  const targetOwner = targetLineage.at(-1);
  const atRoot = importerLineage.length === 1;
  const global = targetLineage.length === 1;

  // @debt a file at an environment root outside the global roles and the root entry is never checked, and neither is an import between two directories of one environment, as the expanded import rules grant and forbid them nothing
  if (
    !elementEnvironments.some((name) => name === importer.environment) ||
    owner === undefined ||
    targetOwner === undefined ||
    importerLineage[0] !== targetLineage[0] ||
    (global ? isIndexOrEntry(target) : targetOwner.kind !== "domain") ||
    (atRoot
      ? importer.kind !== "role" && !isIndexOrEntry(importer)
      : owner.kind !== "domain")
  ) {
    return;
  }

  function violation(
    cause: BoundaryCause,
    boundary?: LineageMember,
    fix?: string,
  ): BoundaryViolation {
    return freeze({
      cause,
      importer,
      target,
      boundary,
      fix,
    });
  }

  // @debt the fix reads the domain's index specifier as the first entry of its surface, which holds only while an alias covers the index
  function privateTo(exposer: LineageMember): BoundaryViolation {
    return violation(
      "privateRole",
      exposer,
      exposer === targetOwner ? target.surface[0] : undefined,
    );
  }

  function reachSurface(split: number): BoundaryViolation | undefined {
    const exposer = targetLineage.slice(split).find((member) => {
      return member.kind === "domain";
    });

    if (
      exposer === undefined ||
      (exposer === targetOwner && isOnSurface(target))
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
        return global ? undefined : violation("globalRole");
      }

      return global || target.public ? undefined : privateTo(targetDomain);
    }

    const split = divergence(importerLineage, targetLineage);
    const within = split === targetLineage.length;

    if (importer.kind === "domain" && importer.role === entryRoleName) {
      if (within && targetDomain === domain) {
        return isOnSurface(target) ? undefined : privateTo(domain);
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

  return importer.contract?.typeOnly === true && kind === "runtime"
    ? violation("typeOnly")
    : undefined;
}
