// @debt `eslint`, `vite`, `vitest` and `tsdown` own no key, so their options come only from definer arguments
// @barrel /src/*/*/extension.ts default
export { default as projectBuild } from "#project/build/extension";
export { default as projectCache } from "#project/cache/extension";
export { default as projectConfig } from "#project/config/extension";
export { default as projectEnvironments } from "#project/environments/extension";
export { default as projectFormat } from "#project/format/extension";
export { default as projectPackage } from "#project/package/extension";
export { default as projectPresets } from "#project/presets/extension";
export { default as projectRoles } from "#project/roles/extension";
export { default as projectStructure } from "#project/structure/extension";
export { default as projectSync } from "#project/sync/extension";
export { default as projectTsconfig } from "#project/tsconfig/extension";
export { default as projectWorkspaces } from "#project/workspaces/extension";
export { default as toolsAgents } from "#tools/agents/extension";
export { default as toolsChangesets } from "#tools/changesets/extension";
export { default as toolsEslint } from "#tools/eslint/extension";
export { default as toolsGit } from "#tools/git/extension";
export { default as toolsGithub } from "#tools/github/extension";
export { default as toolsJscpd } from "#tools/jscpd/extension";
export { default as toolsLefthook } from "#tools/lefthook/extension";
export { default as toolsPnpm } from "#tools/pnpm/extension";
export { default as toolsPrettier } from "#tools/prettier/extension";
export { default as toolsShopify } from "#tools/shopify/extension";
export { default as toolsTsdown } from "#tools/tsdown/extension";
export { default as toolsTypescript } from "#tools/typescript/extension";
export { default as toolsVite } from "#tools/vite/extension";
export { default as toolsVitest } from "#tools/vitest/extension";
export { default as toolsVscode } from "#tools/vscode/extension";
export { default as workflowsCli } from "#workflows/cli/extension";
export { default as workflowsGate } from "#workflows/gate/extension";
export { default as workflowsSync } from "#workflows/sync/extension";
// @end
