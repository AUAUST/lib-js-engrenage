import { format } from "prettier";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";

export async function formatWithPrettierConfig(
  source: string,
  options?: Config,
): Promise<string> {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": "export default {};\n",
  });

  const config = await createPrettierConfig(
    await loadConfig(project.root),
    options,
  );

  return format(source, {
    ...config,
    parser: "typescript",
  });
}
