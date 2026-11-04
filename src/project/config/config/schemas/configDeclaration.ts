import { buildSchema } from "#build/config/schemas/buildSchema";
import { cacheSchema } from "#config/config/schemas/core/cacheSchema";
import { debugSchema } from "#config/config/schemas/core/debugSchema";
import { defineSchema } from "#config/config/schemas/core/defineSchema";
import { agentsSchema } from "#config/config/schemas/tools/agentsSchema";
import { githubSchema } from "#config/config/schemas/tools/githubSchema";
import { gitSchema } from "#config/config/schemas/tools/gitSchema";
import { prettierSchema } from "#config/config/schemas/tools/prettierSchema";
import { typescriptSchema } from "#config/config/schemas/tools/typescriptSchema";
import { vscodeSchema } from "#config/config/schemas/tools/vscodeSchema";
import { binSchema } from "#environments/config/schemas/binSchema";
import { dataSchema } from "#environments/config/schemas/dataSchema";
import { runtimeSchema } from "#environments/config/schemas/runtimeSchema";
import { scriptsSchema } from "#environments/config/schemas/scriptsSchema";
import { sourceSchema } from "#environments/config/schemas/sourceSchema";
import { testsSchema } from "#environments/config/schemas/testsSchema";
import { toolingSchema } from "#environments/config/schemas/toolingSchema";
import { declareObject } from "#options/utils/declareObject";
import { presetsSchema } from "#presets/config/schemas/presetsSchema";
import { aliasesSchema } from "#structure/config/schemas/aliasesSchema";
import { rolesSchema } from "#structure/config/schemas/rolesSchema";

export const configDeclaration = declareObject({
  // Core
  aliases: aliasesSchema,
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
