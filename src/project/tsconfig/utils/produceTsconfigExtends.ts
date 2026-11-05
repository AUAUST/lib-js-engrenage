import { engrenage } from "#constants";
import { resolveListOption } from "#foundation/options/index";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

async function createDefaultExtends(
  config: ConfigContext,
  { key, file }: TsconfigTarget,
): Promise<() => readonly string[]> {
  if (key === "base") {
    const { published } = await config.get("traits");

    return () => {
      return published
        ? [`${engrenage}/tsconfig/library.json`]
        : [`${engrenage}/tsconfig/base.json`];
    };
  }

  const tests = await config.get("tests");
  const typescript = await config.get("typescript");

  const parent =
    key === "tests.dist" ? tests.tsconfig.file : typescript.tsconfig.file;

  return () => {
    return parent === undefined ? [] : [toTsconfigSpecifier(file, parent)];
  };
}

export async function produceTsconfigExtends(
  config: ConfigContext,
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
