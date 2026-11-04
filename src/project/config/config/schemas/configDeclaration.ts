import { declareObject } from "#foundation/options/utils/declareObject";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { cacheSchema } from "#project/config/config/schemas/core/cacheSchema";
import { debugSchema } from "#project/config/config/schemas/core/debugSchema";
import { defineSchema } from "#project/config/config/schemas/core/defineSchema";
import { typescriptSchema } from "#project/config/config/schemas/tools/typescriptSchema";
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
// @debt reaches into tools, a higher layer than project; the registry (#143 step 5) composes the tool sections and removes the upward dependency
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";
import { githubSchema } from "#tools/github/config/schemas/githubSchema";
import { prettierSchema } from "#tools/prettier/config/schemas/prettierSchema";
import { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";

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
