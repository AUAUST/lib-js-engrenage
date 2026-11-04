import { wrap } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { testsSetupRole } from "#project/structure/constants";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { ResolvedTests } from "#project/environments/types/ResolvedTests";
import type { Files } from "#types/Files";

export function findSetupFiles({
  tests,
  filesystem,
}: {
  tests: ResolvedTests;
  filesystem: Filesystem;
}): Files {
  const { file } = tests.roles.roles[testsSetupRole] ?? {};

  if (file === undefined) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, wrap(file)));
}
