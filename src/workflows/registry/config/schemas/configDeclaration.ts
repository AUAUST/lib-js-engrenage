import { declareObject } from "#foundation/options/utils/declareObject";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { cacheSchema } from "#project/config/config/schemas/core/cacheSchema";
import { debugSchema } from "#project/config/config/schemas/core/debugSchema";
import { defineSchema } from "#project/config/config/schemas/core/defineSchema";
import { binSchema } from "#project/environments/config/schemas/binSchema";
import { dataSchema } from "#project/environments/config/schemas/dataSchema";
import { runtimeSchema } from "#project/environments/config/schemas/runtimeSchema";
import { scriptsSchema } from "#project/environments/config/schemas/scriptsSchema";
import { sourceSchema } from "#project/environments/config/schemas/sourceSchema";
import { testsSchema } from "#project/environments/config/schemas/testsSchema";
import { toolingSchema } from "#project/environments/config/schemas/toolingSchema";
import { formatSchema } from "#project/format/config/schemas/formatSchema";
import { presetSchema } from "#project/presets/config/schemas/presetSchema";
import { traitsSchema } from "#project/presets/config/schemas/traitsSchema";
import { aliasesSchema } from "#project/structure/config/schemas/aliasesSchema";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";
import { typescriptSchema } from "#project/tsconfig/config/schemas/typescriptSchema";
import { workspacesSchema } from "#project/workspaces/config/schemas/workspacesSchema";
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
  format: formatSchema,
  preset: presetSchema,
  roles: rolesSchema,
  traits: traitsSchema,

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
  workspaces: workspacesSchema,
});
