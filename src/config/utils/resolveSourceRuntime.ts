import { freeze } from "@auaust/toolkit/object";

import { resolveNodeRuntime } from "#config/utils/resolveNodeRuntime";
import { findCurrentMonth } from "#typescript/utils/findCurrentMonth";
import { resolveBaselineLibrary } from "#typescript/utils/resolveBaselineLibrary";
import { resolveBaselineMinimums } from "#typescript/utils/resolveBaselineMinimums";
import type { Runtime } from "#config/types/Runtime";

export function resolveSourceRuntime(option: {
  baseline?: string | undefined;
  node?: number | undefined;
  apis?: unknown;
}): Runtime | undefined {
  const { baseline, node, apis } = option;

  if (baseline !== undefined && node !== undefined) {
    throw new Error(
      "src.baseline and src.node are mutually exclusive: set one of them",
    );
  }

  if (node !== undefined && apis !== undefined) {
    throw new Error(
      "src.apis only applies to a baseline runtime: src.node already provides these APIs through its types",
    );
  }

  if (node !== undefined) {
    return resolveNodeRuntime(node, "src.node");
  }

  if (baseline === undefined && apis !== undefined) {
    throw new Error(
      `src.apis only applies to a baseline runtime: set src.baseline, for instance to ${findCurrentMonth()}, the current month`,
    );
  }

  if (baseline === undefined) {
    return void console.warn(
      `src.baseline is not set, so the src tsconfig gets no baseline libraries or types and the build no target: set it to ${findCurrentMonth()}, the current month`,
    );
  }

  return freeze({
    kind: "baseline",
    snapshot: baseline,
    library: resolveBaselineLibrary(baseline),
    ...resolveBaselineMinimums(baseline),
  });
}
