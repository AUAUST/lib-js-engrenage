import { resolveTsconfigLibrary } from "#project/tsconfig/operations/resolveTsconfigLibrary";
import { readTsconfigValue } from "#project/tsconfig/utils/readTsconfigValue";
import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigLibrary(
  config: ProjectConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  if (target.key === "base") {
    return [];
  }

  const removeNoLibrary: JsonEdit = {
    path: ["compilerOptions", "noLib"],
    value: undefined,
  };

  const library = resolveTsconfigLibrary(config, target);

  if (library !== false) {
    return [
      removeNoLibrary,
      { path: ["compilerOptions", "lib"], value: [...library] },
    ];
  }

  return target.lib === false ||
    readTsconfigValue(config, target, ["compilerOptions", "lib"]) !== null
    ? [removeNoLibrary]
    : [removeNoLibrary, { path: ["compilerOptions", "lib"], value: undefined }];
}
