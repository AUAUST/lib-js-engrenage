import { listStaticFileGlobs, type ResolvedRoles } from "#batiment/roles/index";
import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { testsetup } from "#project/roles/index";
import type { ResolvedTests } from "#project/environments/index";
import type { Files } from "#types/Files";

export async function findSetupFiles({
  tests,
  roles,
  filesystem,
}: {
  tests: ResolvedTests;
  roles: ResolvedRoles;
  filesystem: Filesystem;
}): Promise<Files> {
  const globs = listStaticFileGlobs(roles.roles[testsetup().name]?.file);

  if (globs.length === 0) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, globs));
}
