import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import type { Filesystem } from "#foundation/filesystem/index";

export async function hasConfigFile(
  filesystem: Filesystem,
  tool: string,
): Promise<boolean> {
  const files = await filesystem.glob(`${tool}.config.*`);

  return isNotEmpty(files);
}
