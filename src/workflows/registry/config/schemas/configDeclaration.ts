import { declareObject } from "#foundation/options/index";
import { buildSchema } from "#project/build/index";
import { cacheSchema, debugSchema, defineSchema } from "#project/config/index";
import {
  binSchema,
  dataSchema,
  runtimeSchema,
  scriptsSchema,
  sourceSchema,
  testsSchema,
  toolingSchema,
} from "#project/environments/index";
import { formatSchema } from "#project/format/index";
import { presetSchema, traitsSchema } from "#project/presets/index";
import { aliasesSchema, rolesSchema } from "#project/structure/index";
import { typescriptSchema } from "#project/tsconfig/index";
import { workspacesSchema } from "#project/workspaces/index";
import { agentsSchema } from "#tools/agents/index";
import { gitSchema } from "#tools/git/index";
import { githubSchema } from "#tools/github/index";
import { prettierSchema } from "#tools/prettier/index";
import { vscodeSchema } from "#tools/vscode/index";

// @debt the `Core`, `Tooling` and `Environments` comments explain the code, outside the allowed comment kinds; `eslint`, `vite`, `vitest` and `tsdown` take no section here, so their options come only from definer arguments
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
