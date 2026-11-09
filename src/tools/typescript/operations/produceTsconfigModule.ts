import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

export async function produceTsconfigModule(
  config: LoadedConfig,
  { key }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key !== "src") {
    return [];
  }

  const { bundled } = await config.resolve("src");

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
