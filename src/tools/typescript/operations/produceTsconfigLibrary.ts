import {
  readTsconfigValue,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigLibrary } from "#tools/typescript/operations/resolveTsconfigLibrary";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

export async function produceTsconfigLibrary(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (target.key === "base") {
    return [];
  }

  const removeNoLibrary: JsonEdit = {
    path: ["compilerOptions", "noLib"],
    value: undefined,
  };

  const library = await resolveTsconfigLibrary(config, target);

  if (library !== false) {
    return [
      removeNoLibrary,
      { path: ["compilerOptions", "lib"], value: [...library] },
    ];
  }

  return target.lib === false ||
    (await readTsconfigValue(config, target, ["compilerOptions", "lib"])) !==
      null
    ? [removeNoLibrary]
    : [removeNoLibrary, { path: ["compilerOptions", "lib"], value: undefined }];
}
