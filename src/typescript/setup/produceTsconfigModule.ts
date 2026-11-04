import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

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
