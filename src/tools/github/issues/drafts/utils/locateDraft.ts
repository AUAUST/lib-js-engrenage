import {
  draftExtension,
  issueDraftsDirectory,
} from "#tools/github/issues/drafts/constants";
import type { File } from "#types/File";

export function locateDraft(stem: string): File {
  return `${issueDraftsDirectory}${stem}${draftExtension}`;
}
