import { wrap } from "@auaust/primitive-kit/arrays";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { testsetup } from "#project/roles/index";
import type { ResolvedTests } from "#project/environments/index";
import type { ResolvedRoles } from "#project/structure/index";
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
  const { file } = roles.roles[testsetup().name] ?? {};

  if (file === undefined) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, wrap(file)));
}
