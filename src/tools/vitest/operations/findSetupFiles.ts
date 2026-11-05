import { wrap } from "@auaust/primitive-kit/arrays";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { testsSetupRole } from "#project/structure/constants";
import type { ResolvedTests } from "#project/environments/index";
import type { Files } from "#types/Files";

export async function findSetupFiles({
  tests,
  filesystem,
}: {
  tests: ResolvedTests;
  filesystem: Filesystem;
}): Promise<Files> {
  const { file } = tests.roles.roles[testsSetupRole] ?? {};

  if (file === undefined) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, wrap(file)));
}
