import { isMap, isScalar, isSeq, type Document } from "yaml";

import { filter } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { workspaceFile, workspaceSettings } from "#tools/pnpm/constants";

export function addWorkspaceSettings(document: Document): boolean {
  const builds = document.get("allowBuilds", true);

  if (builds !== undefined && !isMap(builds)) {
    throw new Error(`allowBuilds in ${workspaceFile} must be a YAML mapping`);
  }

  const excluded = document.get("minimumReleaseAgeExclude", true);

  if (excluded !== undefined && !isSeq(excluded)) {
    throw new Error(
      `minimumReleaseAgeExclude in ${workspaceFile} must be a YAML sequence`,
    );
  }

  let changed = false;

  for (const [name, allowed] of entries(workspaceSettings.allowBuilds)) {
    const path = ["allowBuilds", name];

    if (document.hasIn(path)) {
      continue;
    }

    document.setIn(path, allowed);

    changed = true;
  }

  const missing = filter(
    workspaceSettings.minimumReleaseAgeExclude,
    (pattern) => {
      return !excluded?.items.some((item) => {
        return isScalar(item) && item.value === pattern;
      });
    },
  );

  if (missing.length > 0) {
    if (excluded === undefined) {
      document.set("minimumReleaseAgeExclude", document.createNode(missing));
    } else {
      for (const pattern of missing) {
        excluded.add(pattern);
      }
    }

    changed = true;
  }

  return changed;
}
