import { basename } from "node:path";

import {
  draftExtension,
  issueDraftsDirectory,
} from "#tools/github/issues/drafts/constants";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";

async function readKnownDraft(filesystem: Filesystem, file: string) {
  try {
    return await readDraft(filesystem, file);
  } catch {
    return;
  }
}

export async function readLocalDrafts(
  filesystem: Filesystem,
): Promise<ReadonlyMap<string, Draft | undefined>> {
  const files = await filesystem.glob(
    `${issueDraftsDirectory}*${draftExtension}`,
  );

  const drafts = await Promise.all(
    files.map(async (file) => {
      return [
        basename(file).slice(0, -draftExtension.length),
        await readKnownDraft(filesystem, file),
      ] as const;
    }),
  );

  return new Map(drafts);
}
