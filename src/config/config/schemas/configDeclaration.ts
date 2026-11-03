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
import { declareObject } from "#foundation/options/utils/declareObject";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";

export const configDeclaration = declareObject({
  // Core
  build: buildSchema,
  cache: cacheSchema,
  debug: debugSchema,
  define: defineSchema,
  presets: presetsSchema,
  roles: rolesSchema,

  // Tooling
  agents: agentsSchema,
  git: gitSchema,
  github: githubSchema,
  prettier: prettierSchema,
  typescript: typescriptSchema,
  vscode: vscodeSchema,

  // Environments
  bin: binSchema,
  data: dataSchema,
  runtime: runtimeSchema,
  scripts: scriptsSchema,
  src: sourceSchema,
  tests: testsSchema,
  tooling: toolingSchema,
});
