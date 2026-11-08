import { glob } from "node:fs/promises";
import { join } from "node:path";

import { generateConfigTypes } from "#scripts/codegen/operations/generateConfigTypes";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { settleChanges } from "#workflows/sync/operations/settleChanges";
import type { File } from "#types/File";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const resolved = await loadValidatedConfig();

  const modules = new Map<File, Record<string, unknown>>();

  for await (const file of glob("src/**/config/schemas/*.ts", {
    cwd: join(import.meta.dirname, "../../.."),
  })) {
    modules.set(file, await import(`#${file.slice("src/".length, -3)}`));
  }

  await generateConfigTypes(resolved, modules);

  await settleChanges(resolved, {
    check,
  });
}
