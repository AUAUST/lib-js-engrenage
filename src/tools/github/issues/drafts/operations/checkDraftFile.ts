import { basename, dirname, isAbsolute, join, relative } from "node:path";

import {
  draftExtension,
  issueDraftsDirectory,
} from "#tools/github/issues/drafts/constants";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { readLocalDrafts } from "#tools/github/issues/drafts/operations/readLocalDrafts";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { checkDrafts } from "#tools/github/issues/drafts/utils/checkDrafts";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import type { LoadedConfig } from "#project/config/index";
import type {
  IssueAudience,
  IssueFinding,
} from "#tools/github/issues/contract/index";
import type { File } from "#types/File";

function findDraftStem(root: string, file: File) {
  const path = relative(root, file);
  const name = basename(path);

  const stem = name.slice(0, -draftExtension.length);

  return isAbsolute(file) &&
    name.endsWith(draftExtension) &&
    stem !== "" &&
    join(dirname(path), "/") === issueDraftsDirectory
    ? stem
    : undefined;
}

/**
 * Checks the draft at an absolute path as `planning issue check` checks it, once
 * the path names a draft file of the project's own drafts directory.
 */
export async function checkDraftFile(
  config: LoadedConfig,
  file: File,
  audience: IssueAudience,
): Promise<readonly IssueFinding[]> {
  const { root, filesystem } = config.context;

  const stem = findDraftStem(root, file);

  if (stem === undefined) {
    return [
      {
        rule: "draft-location",
        message: `\`${file}\` is not a draft of this checkout: name the absolute path of a \`<ref>${draftExtension}\` file in ${join(root, issueDraftsDirectory)}.`,
      },
    ];
  }

  const draft = await readDraft(filesystem, locateDraft(stem));

  if (draft === undefined) {
    return [{ rule: "draft-missing", message: `No draft at \`${file}\`.` }];
  }

  const [context, known] = await Promise.all([
    resolveDraftsContext(config),
    readLocalDrafts(filesystem),
  ]);

  const checked = checkDrafts(new Map([[stem, draft]]), context, {
    known,
    complete: audience === "worker",
  });

  return checked.get(stem) ?? [];
}
