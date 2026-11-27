import { freeze } from "@auaust/toolkit/object";

import { assertBaselineSnapshot } from "#project/baseline/utils/assertBaselineSnapshot";
import { findCurrentMonth } from "#project/baseline/utils/findCurrentMonth";
import { listEsSelections } from "#project/baseline/utils/listEsSelections";
import { resolveBaselineMinimums } from "#project/baseline/utils/resolveBaselineMinimums";
import { selectEsLibraries } from "#project/baseline/utils/selectEsLibraries";
import type { Reporter } from "#nexus/reports/index";
import type { Runtime } from "#project/baseline/types/Runtime";

/**
 * The baseline runtime of `snapshot`, the setting `subject` names; without one,
 * a warning and `undefined`.
 *
 * @throws {Error} `snapshot` is no `YYYY-MM` month, is after the current month
 * or predates every widely available ES edition.
 */
export function resolveBaselineRuntime(
  snapshot: string | undefined,
  subject: string,
  reporter: Reporter,
): Extract<Runtime, { kind: "baseline" }> | undefined {
  if (snapshot === undefined) {
    return void reporter.warn(
      `${subject} is not set, so its tsconfig gets no baseline libraries or types and its build no target`,
      { fix: `set it to ${findCurrentMonth()}, the current month` },
    );
  }

  assertBaselineSnapshot(snapshot);

  const current = findCurrentMonth();

  if (snapshot > current) {
    throw new Error(
      `${subject} ${snapshot} is after the current month ${current}`,
    );
  }

  const minimums = resolveBaselineMinimums(snapshot);
  const library = selectEsLibraries(snapshot);

  if (library === undefined) {
    throw new Error(
      `${subject} ${snapshot} predates every widely available ES edition: the earliest accepted snapshot is ${listEsSelections()[0]?.from}`,
    );
  }

  return freeze({
    kind: "baseline",
    snapshot,
    lib: library,
    ...minimums,
  });
}
