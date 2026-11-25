import { readFile } from "node:fs/promises";

import { resolveDataFile } from "#foundation/data/index";
import { missingCompassTemplate } from "#tools/metalbrain/constants";
import type { LoadedConfig } from "#project/config/index";

export async function fillCompass(config: LoadedConfig): Promise<string> {
  const { compass } = await config.resolve("agents");

  if (compass !== undefined) {
    return compass;
  }

  const template = await readFile(
    resolveDataFile(missingCompassTemplate),
    "utf-8",
  );

  return template.trim();
}
