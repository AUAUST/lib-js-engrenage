import { githubSnapshotFile } from "#tools/github/issues/api/constants";
import type { FileLocation } from "#project/config/index";

export function locateGithubSnapshot(): FileLocation {
  return { file: githubSnapshotFile };
}
