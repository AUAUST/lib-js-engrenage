import {
  fetchedExtension,
  issueDraftsDirectory,
} from "#tools/github/issues/drafts/constants";
import type { File } from "#types/File";

export function locateFetchedIssue(stem: string): File {
  return `${issueDraftsDirectory}${stem}${fetchedExtension}`;
}
