import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function produceTsconfigModule(
  { src }: ProjectConfig,
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
