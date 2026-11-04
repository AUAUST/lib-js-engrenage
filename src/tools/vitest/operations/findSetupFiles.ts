import { wrap } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { testsSetupRole } from "#project/structure/constants";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Files } from "#types/Files";

export function findSetupFiles({ tests, filesystem }: ResolvedConfig): Files {
  const { file } = tests.roles.roles[testsSetupRole] ?? {};

  if (file === undefined) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, wrap(file)));
}
