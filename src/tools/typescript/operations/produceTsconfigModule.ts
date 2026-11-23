import { resolveTsconfigExecution } from "#tools/typescript/operations/resolveTsconfigExecution";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

export async function produceTsconfigModule(
  config: LoadedConfig,
  { key }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const execution = await resolveTsconfigExecution(config, key);

  if (execution?.module === undefined) {
    return [];
  }

  const { bundled } = execution;

  return [
    {
      path: ["compilerOptions", "module"],
      value: bundled ? "ESNext" : "NodeNext",
    },
    {
      path: ["compilerOptions", "moduleResolution"],
      value: bundled ? "Bundler" : "NodeNext",
    },
  ];
}
