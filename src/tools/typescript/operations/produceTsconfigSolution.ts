import { map } from "@auaust/toolkit/array";

import {
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { partitionInstanceTsconfigs } from "#tools/typescript/operations/partitionInstanceTsconfigs";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";

export async function produceTsconfigSolution(
  config: LoadedConfig,
  { key, file }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key !== "base") {
    return [];
  }

  const { checked } = await partitionInstanceTsconfigs(config);

  return [
    {
      path: ["files"],
      value: [],
    },
    {
      path: ["references"],
      value: map(checked, (referenced) => {
        return { path: toTsconfigSpecifier(file, referenced) };
      }),
    },
  ];
}
