import { posix } from "node:path";

import { metalbrain, sharedFilesKind } from "#tools/agents/constants";
import { isSupportingReference } from "#tools/agents/utils/isSupportingReference";

/**
 * Whether `reference` names a file sync installs beside the skill of
 * `skillReference`: one of its supporting files or a shared file.
 */
export function isSkillFileReference(
  reference: string,
  skillReference: string,
): boolean {
  const directory = posix.dirname(reference);

  return (
    isSupportingReference(reference, skillReference) ||
    (posix.basename(directory) === sharedFilesKind &&
      posix.basename(posix.dirname(directory)) === metalbrain)
  );
}
