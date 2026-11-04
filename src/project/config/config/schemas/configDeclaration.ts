import { declareObject } from "#foundation/options/utils/declareObject";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { cacheSchema } from "#project/config/config/schemas/core/cacheSchema";
import { debugSchema } from "#project/config/config/schemas/core/debugSchema";
import { defineSchema } from "#project/config/config/schemas/core/defineSchema";
import { agentsSchema } from "#project/config/config/schemas/tools/agentsSchema";
import { githubSchema } from "#project/config/config/schemas/tools/githubSchema";
import { gitSchema } from "#project/config/config/schemas/tools/gitSchema";
import { prettierSchema } from "#project/config/config/schemas/tools/prettierSchema";
import { typescriptSchema } from "#project/config/config/schemas/tools/typescriptSchema";
import { vscodeSchema } from "#project/config/config/schemas/tools/vscodeSchema";
import { binSchema } from "#project/environments/config/schemas/binSchema";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
import { presetsSchema } from "#project/presets/config/schemas/presetsSchema";
import { aliasesSchema } from "#project/structure/config/schemas/aliasesSchema";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";

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
