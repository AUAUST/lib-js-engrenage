/* eslint-disable auaust/no-dynamic-import */

import { glob } from "node:fs/promises";
import { join } from "node:path";

import { defineCommand } from "#workflows/cli/operations/defineCommand";
import type { File } from "#types/File";

export const config = defineCommand((command) => {
  return command
    .description(
      "Generate `ConfigInput` and the documented config input interfaces from the descriptions of the config schemas.",
    )
    .option("--check", "report an outdated file without writing it", false)
    .action(async ({ check }) => {
      const { loadConfig } =
        await import("#workflows/registry/operations/loadConfig");

      const { generateConfigTypes } =
        await import("#scripts/codegen/operations/generateConfigTypes");

      const { settleChanges } =
        await import("#workflows/cli/operations/settleChanges");

      const resolved = await loadConfig();

      const modules = new Map<File, Record<string, unknown>>();

      for await (const file of glob("src/**/config/schemas/*.ts", {
        cwd: join(import.meta.dirname, "../.."),
      })) {
        modules.set(file, await import(`#${file.slice("src/".length, -3)}`));
      }

      await generateConfigTypes(resolved, modules);

      await settleChanges(resolved, {
        check,
      });
    });
});
