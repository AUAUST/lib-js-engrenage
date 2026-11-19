import { posix } from "node:path";

import { isSkillFileReference } from "#tools/agents/utils/isSkillFileReference";
import { listReferences } from "#tools/agents/utils/listReferences";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

/**
 * The files beside an installed skill that reference one of its supporting files
 * or a shared file but that the skill's rendering no longer generates.
 */
export async function listStaleSkillFiles(
  filesystem: Filesystem,
  skillFile: File,
  skill: { reference: string; files: readonly { file: File }[] },
): Promise<readonly File[]> {
  const stale: File[] = [];

  for (const file of await filesystem.glob(
    `${posix.dirname(skillFile)}/*.md`,
  )) {
    if (skill.files.some((output) => output.file === file)) {
      continue;
    }

    const references = listReferences((await filesystem.read(file)) ?? "");

    if (
      references.some((reference) => {
        return isSkillFileReference(reference, skill.reference);
      })
    ) {
      stale.push(file);
    }
  }

  return stale;
}
