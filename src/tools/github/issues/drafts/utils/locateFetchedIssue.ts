import {
  fetchedExtension,
  issueDraftsDirectory,
} from "#tools/github/issues/drafts/constants";
import type { File } from "#types/File";

export function locateFetchedIssue(number: number): File {
  return `${issueDraftsDirectory}${number}${fetchedExtension}`;
}
