import { engrenage } from "#constants";
import { resolveListOption } from "#foundation/options/index";
import { testsSection } from "#project/environments/index";
import { traitsSection } from "#project/presets/index";
import {
  toTsconfigSpecifier,
  typescriptSection,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

async function createDefaultExtends(
  config: LoadedConfig,
  { key, file }: TsconfigTarget,
): Promise<() => readonly string[]> {
  if (key === "base") {
    const { published } = await config.resolve(traitsSection);

    return () => {
      return published
        ? [`${engrenage}/tsconfig/library.json`]
        : [`${engrenage}/tsconfig/base.json`];
    };
  }

  const tests = await config.resolve(testsSection);
  const typescript = await config.resolve(typescriptSection);

  const parent =
    key === "tests.dist" ? tests.tsconfig.file : typescript.tsconfig.file;

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
    `${target.key}.tsconfig.extends`,
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
