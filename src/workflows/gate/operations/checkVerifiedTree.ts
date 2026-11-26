import { iterable } from "@auaust/toolkit";
import { toArray } from "@auaust/toolkit/array";

import { runGit, type ChangeMode } from "#tools/git/index";
import type { Directory } from "#types/Directory";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { TreeIdentity } from "#workflows/gate/types/TreeIdentity";

/**
 * Fails the run when the tree changed between the identity the checks verified
 * and the current one, naming the files that changed.
 */
export async function checkVerifiedTree(
  root: Directory,
  mode: ChangeMode,
  verified: TreeIdentity,
  current: TreeIdentity,
): Promise<GateFailure | undefined> {
  const changed: (readonly [string, string])[] = [];

  if (verified.committable !== current.committable) {
    changed.push([verified.committable, current.committable]);
  }

  if (mode === "staged" && verified.checked !== current.checked) {
    changed.push([verified.checked, current.checked]);
  }

  if (changed.length === 0) {
    return;
  }

  const outputs = await Promise.all(
    iterable.map(changed, ([before, after]) => {
      return runGit(root, ["diff-tree", "-r", "--name-only", before, after]);
    }),
  );

  const paths = toArray(
    iterable.unique(
      outputs
        .join("\n")
        .split("\n")
        .filter((path) => path !== ""),
    ),
  );

  return {
    step: "verification",
    output: `Files changed while the gate verified them; run it again:\n${paths.join("\n")}`,
  };
}
