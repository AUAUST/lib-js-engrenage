import { engrenage } from "#constants";
import { resolveListOption } from "#foundation/options/index";
import { resolveEnvironmentTsconfig } from "#project/environments/index";
import {
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { toTsconfigOptionPath } from "#tools/typescript/utils/toTsconfigOptionPath";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

async function createDefaultExtends(
  config: LoadedConfig,
  { key, file }: TsconfigTarget,
): Promise<() => readonly string[]> {
  if (key === "base") {
    const { published } = await config.resolve("traits");

    return () => {
      return published
        ? [`${engrenage}/tsconfig/library.json`]
        : [`${engrenage}/tsconfig/base.json`];
    };
  }

  const typescript = await config.resolve("typescript");

  const { file: parent } = key === "tests.dist"
    ? await resolveEnvironmentTsconfig(config, "tests")
    : typescript.tsconfig;

  return () => {
    return parent === undefined ? [] : [toTsconfigSpecifier(file, parent)];
  };
}

export async function produceTsconfigExtends(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const bases = resolveListOption(
    target.extends,
    await createDefaultExtends(config, target),
    `${toTsconfigOptionPath(target.key)}.extends`,
    config.context.reporter,
  );

  if (bases === false) {
    return [];
  }

  return [
    {
      path: ["extends"],
      value: bases.length === 1 ? bases[0] : [...bases],
    },
  ];
}
