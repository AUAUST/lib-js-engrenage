import { readTsconfigValue } from "#typescript/utils/readTsconfigValue";
import { resolveTsconfigLibrary } from "#typescript/utils/resolveTsconfigLibrary";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function produceTsconfigLibrary(
  config: ResolvedConfig,
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
