import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigModule(
  { src }: ResolvedConfig,
  { key }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key !== "src") {
    return [];
  }

  const value = src.bundled ? "ESNext" : "NodeNext";

  return [
    {
      path: ["compilerOptions", "module"],
      value,
    },
    {
      path: ["compilerOptions", "moduleResolution"],
      value: src.bundled ? "Bundler" : "NodeNext",
    },
  ];
}
