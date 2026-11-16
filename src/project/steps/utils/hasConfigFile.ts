import { isNonEmptyArray } from "@auaust/toolkit/array";

import type { Filesystem } from "#foundation/filesystem/index";

export async function hasConfigFile(
  filesystem: Filesystem,
  tool: string,
): Promise<boolean> {
  const files = await filesystem.glob(`${tool}.config.*`);

  return isNonEmptyArray(files);
}
