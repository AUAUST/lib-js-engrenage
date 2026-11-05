import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { tsconfigEnvironments } from "#project/tsconfig/constants";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { File } from "#types/File";

async function listReferencedFiles(
  config: ConfigContext,
): Promise<readonly File[]> {
  const files: File[] = [];

  for (const name of tsconfigEnvironments) {
    const { active, tsconfig } = await config.get(name);
    const { owner, file, check } = tsconfig;

    if (active && owner === name && check && file !== undefined) {
      files.push(file);
    }
  }

  return [
    ...files,
    ...flatMap(await config.get("workspaces"), ({ workspaces }) => {
      return map(workspaces, ({ tsconfig }) => tsconfig);
    }),
  ];
}

export async function produceTsconfigSolution(
  config: ConfigContext,
  { key, file }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
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
      value: map(await listReferencedFiles(config), (referenced) => {
        return { path: toTsconfigSpecifier(file, referenced) };
      }),
    },
  ];
}
