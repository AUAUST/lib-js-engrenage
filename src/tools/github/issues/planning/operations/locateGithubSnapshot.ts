import { githubSnapshotFile } from "#tools/github/issues/api/constants";
import type { FileLocation } from "#project/config/index";

// @debt `fetchGithubSnapshot` and `readGithubSnapshot` resolve `githubSnapshotFile` directly instead of the `state.github` resource, so this location and theirs agree only while both read the constant
export function locateGithubSnapshot(): FileLocation {
  return { file: githubSnapshotFile };
}
