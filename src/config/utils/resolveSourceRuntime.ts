import { freeze } from "@auaust/toolkit/object";

import { resolveNodeRuntime } from "#config/utils/resolveNodeRuntime";
import { assertBaselineSnapshot } from "#typescript/utils/assertBaselineSnapshot";
import { findCurrentMonth } from "#typescript/utils/findCurrentMonth";
import { listEsSelections } from "#typescript/utils/listEsSelections";
import { resolveBaselineMinimums } from "#typescript/utils/resolveBaselineMinimums";
import { selectEsLibraries } from "#typescript/utils/selectEsLibraries";
import type { Runtime } from "#config/types/Runtime";

export function resolveSourceRuntime({
  baseline,
  node,
}: {
  baseline: string | undefined;
  node: number | undefined;
}): Runtime | undefined {
  if (node !== undefined) {
    return resolveNodeRuntime(node, "src.node");
  }

  if (baseline === undefined) {
    return void console.warn(
      `src.baseline is not set, so the src tsconfig gets no baseline libraries or types and the build no target: set it to ${findCurrentMonth()}, the current month`,
    );
  }

  assertBaselineSnapshot(baseline);

  const current = findCurrentMonth();

  if (baseline > current) {
    throw new Error(
      `src.baseline ${baseline} is after the current month ${current}`,
    );
  }

  const minimums = resolveBaselineMinimums(baseline);
  const library = selectEsLibraries(baseline);

  if (library === undefined) {
    throw new Error(
      `src.baseline ${baseline} predates every widely available ES edition: the earliest accepted snapshot is ${listEsSelections()[0]?.from}`,
    );
  }

  return freeze({
    kind: "baseline",
    snapshot: baseline,
    lib: library,
    ...minimums,
  });
}
