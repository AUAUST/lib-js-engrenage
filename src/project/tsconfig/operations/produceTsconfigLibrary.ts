import { readTsconfigValue } from "#tsconfig/operations/readTsconfigValue";
import { resolveTsconfigLibrary } from "#tsconfig/operations/resolveTsconfigLibrary";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

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
