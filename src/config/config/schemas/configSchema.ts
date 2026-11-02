import { optional, strictObject } from "valibot";

import { buildSchema } from "#config/config/schemas/core/buildSchema";
import { cacheSchema } from "#config/config/schemas/core/cacheSchema";
import { debugSchema } from "#config/config/schemas/core/debugSchema";
import { defineSchema } from "#config/config/schemas/core/defineSchema";
import { presetsSchema } from "#config/config/schemas/core/presetsSchema";
import { binSchema } from "#config/config/schemas/environments/binSchema";
import { dataSchema } from "#config/config/schemas/environments/dataSchema";
import { runtimeSchema } from "#config/config/schemas/environments/runtimeSchema";
import { scriptsSchema } from "#config/config/schemas/environments/scriptsSchema";
import { sourceSchema } from "#config/config/schemas/environments/sourceSchema";
import { testsSchema } from "#config/config/schemas/environments/testsSchema";
import { toolingSchema } from "#config/config/schemas/environments/toolingSchema";
import { agentsSchema } from "#config/config/schemas/tools/agentsSchema";
import { githubSchema } from "#config/config/schemas/tools/githubSchema";
import { gitSchema } from "#config/config/schemas/tools/gitSchema";
import { prettierSchema } from "#config/config/schemas/tools/prettierSchema";
import { typescriptSchema } from "#config/config/schemas/tools/typescriptSchema";
import { vscodeSchema } from "#config/config/schemas/tools/vscodeSchema";

export const configSchema = strictObject({
  // Core
  build: optional(buildSchema),
  cache: optional(cacheSchema),
  debug: optional(debugSchema),
  define: optional(defineSchema),
  presets: optional(presetsSchema),

  // Tooling
  agents: optional(agentsSchema),
  git: optional(gitSchema),
  github: optional(githubSchema),
  prettier: optional(prettierSchema),
  typescript: optional(typescriptSchema),
  vscode: optional(vscodeSchema),

  // Environments
  bin: optional(binSchema),
  data: optional(dataSchema),
  runtime: optional(runtimeSchema),
  scripts: optional(scriptsSchema),
  src: optional(sourceSchema),
  tests: optional(testsSchema),
  tooling: optional(toolingSchema),
});
