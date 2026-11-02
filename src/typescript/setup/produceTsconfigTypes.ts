import { filter, map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

import { resolveListOption } from "#config/utils/resolveListOption";
import { engrenage } from "#constants";
import { readTsconfigValue } from "#typescript/utils/readTsconfigValue";
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

function removeBaselineTypes(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const current = readTsconfigValue(config, target, [
    "compilerOptions",
    "types",
  ]);

  if (!isArray(current)) {
    return [];
  }

  // @debt the prefixes restate what listDefaultTypes writes for a baseline runtime, so a new kind of baseline type must be added in both places
  const kept = filter(current, (type) => {
    return (
      !isString(type) ||
      !(
        type.startsWith("typescript-baseline-lib/") ||
        type.startsWith(`${engrenage}/apis/`)
      )
    );
  });

  if (kept.length === current.length) {
    return [];
  }

  return [
    {
      path: ["compilerOptions", "types"],
      value: kept.length === 0 ? undefined : kept,
    },
  ];
}

export function produceTsconfigTypes(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const { key, types: option } = target;

  if (key === "base") {
    return [];
  }

  const runtime = resolveTsconfigRuntime(config, key);

  if (runtime === undefined && (option == null || option === true)) {
    return removeBaselineTypes(config, target);
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
