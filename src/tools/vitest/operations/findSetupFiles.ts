import { wrap } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#foundation/filesystem/utils/filesIn";
import { testsSetupRole } from "#project/structure/constants";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Files } from "#types/Files";

export function findSetupFiles({ tests, filesystem }: ProjectConfig): Files {
  const { file } = tests.roles.roles[testsSetupRole] ?? {};

  if (file === undefined) {
    return [];
  }

  return filesystem.glob(filesIn(tests.dirs, wrap(file)));
}
