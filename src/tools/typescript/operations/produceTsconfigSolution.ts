import { flatMap, map } from "@auaust/primitive-kit/arrays";

import {
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function listReferencedFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const files: File[] = [];

  for (const name of await listTsconfigEnvironments(config)) {
    const { active, tsconfig } = await resolveTsconfigEnvironment(config, name);

    const { owner, file, check } = tsconfig;

    if (active && owner === name && check && file !== undefined) {
      files.push(file);
    }
  }

  return [
    ...files,
    ...flatMap(await config.resolve("workspaces"), ({ workspaces }) => {
      return map(workspaces, ({ tsconfig }) => tsconfig);
    }),
  ];
}

export async function produceTsconfigSolution(
  config: LoadedConfig,
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
