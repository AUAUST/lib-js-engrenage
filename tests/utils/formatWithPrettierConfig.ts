import { format } from "prettier";

import { loadConfig } from "@auaust/engrenage/extensions";
import { createPrettierConfig, type Config } from "@auaust/engrenage/prettier";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

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
