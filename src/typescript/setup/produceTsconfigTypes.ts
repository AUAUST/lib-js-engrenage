import { map } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/utils/resolveListOption";
import { engrenage } from "#constants";
import { resolveTsconfigRuntime } from "#typescript/utils/resolveTsconfigRuntime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Runtime } from "#config/types/Runtime";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function listDefaultTypes(
  config: ResolvedConfig,
  runtime: Runtime | undefined,
): readonly string[] {
  if (runtime === undefined) {
    return [];
  }

  if (runtime.kind === "node") {
    return ["node"];
  }

  return [
    runtime.library,
    ...map(config.src.apis, (api) => `${engrenage}/apis/${api}`),
  ];
}

export function produceTsconfigTypes(
  config: ResolvedConfig,
  { key, types: option }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key === "base") {
    return [];
  }

  const runtime = resolveTsconfigRuntime(config, key);

  if (runtime === undefined && (option == null || option === true)) {
    return [];
  }

  const types = resolveListOption(
    option,
    () => listDefaultTypes(config, runtime),
    `${key}.tsconfig.types`,
  );

  return types === false
    ? []
    : [{ path: ["compilerOptions", "types"], value: [...types] }];
}
