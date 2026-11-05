import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export async function produceTsconfigModule(
  config: ConfigContext,
  { key }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key !== "src") {
    return [];
  }

  const { bundled } = await config.get("src");

  const value = bundled ? "ESNext" : "NodeNext";

  return [
    {
      path: ["compilerOptions", "module"],
      value,
    },
    {
      path: ["compilerOptions", "moduleResolution"],
      value: bundled ? "Bundler" : "NodeNext",
    },
  ];
}
