import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { tsconfigEnvironments } from "#config/constants";
import { toTsconfigSpecifier } from "#typescript/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function listReferencedFiles(config: ResolvedConfig): readonly File[] {
  return flatMap(tsconfigEnvironments, (name) => {
    const { owner, file, check } = config[name].tsconfig;

    return config[name].active && owner === name && check && file !== undefined
      ? [file]
      : [];
  });
}

export function produceTsconfigSolution(
  config: ResolvedConfig,
  { key, file }: TsconfigTarget,
): readonly JsonEdit[] {
  if (key !== "base") {
    return [];
  }

  return [
    {
      path: ["files"],
      value: [],
    },
    {
      path: ["references"],
      value: map(listReferencedFiles(config), (referenced) => {
        return { path: toTsconfigSpecifier(file, referenced) };
      }),
    },
  ];
}
