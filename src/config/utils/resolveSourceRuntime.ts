import { freeze } from "@auaust/toolkit/object";

import { resolveNodeRuntime } from "#config/utils/resolveNodeRuntime";
import { findLatestBaseline } from "#typescript/utils/findLatestBaseline";
import { listTsconfigPresets } from "#typescript/utils/listTsconfigPresets";
import { resolveBaselineMinimums } from "#typescript/utils/resolveBaselineMinimums";
import type { Runtime } from "#config/types/Runtime";

export function resolveSourceRuntime(option: {
  baseline?: string | undefined;
  node?: number | undefined;
}): Runtime {
  const { baseline, node } = option;

  if (baseline !== undefined && node !== undefined) {
    throw new Error(
      "src.baseline and src.node are mutually exclusive: set one of them",
    );
  }

  if (node !== undefined) {
    return resolveNodeRuntime(node, "src.node");
  }

  const snapshot = baseline ?? findLatestBaseline();
  const available = listTsconfigPresets("baseline");

  if (!available.includes(snapshot)) {
    throw new Error(
      `src.baseline ${snapshot} is not a known snapshot. Available snapshots: ${available.join(", ")}`,
    );
  }

  return freeze({
    kind: "baseline",
    snapshot,
    ...resolveBaselineMinimums(snapshot),
  });
}
