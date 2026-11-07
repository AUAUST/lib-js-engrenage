import { freeze } from "@auaust/toolkit/object";

import { buildSection } from "#project/build/index";
import { cacheSection } from "#project/cache/index";
import {
  binOptionsSection,
  dataSection,
  defineSection,
  runtimeSection,
  scriptsOptionsSection,
  sourceOptionsSection,
  testsOptionsSection,
  toolingOptionsSection,
} from "#project/environments/index";
import { formatSection } from "#project/format/index";
import { visibilitySection } from "#project/package/index";
import { presetSection, traitAdjustmentsSection } from "#project/presets/index";
import {
  aliasesSection,
  structureOptionsSection,
} from "#project/structure/index";
import { typescriptOptionsSection } from "#project/tsconfig/index";
import { workspacesSection } from "#project/workspaces/index";
import { agentsSection } from "#tools/agents/index";
import { gitSection } from "#tools/git/index";
import { githubSection } from "#tools/github/index";
import { prettierSection } from "#tools/prettier/index";
import { vscodeSection } from "#tools/vscode/index";
import { debugSection } from "#workflows/cli/index";

// @debt `Section` erases its declaration's type, so `ConfigInput` cannot be checked against these sections by type and every reader must assert each declaration is present
// @debt `eslint`, `vite`, `vitest` and `tsdown` take no section here, so their options come only from definer arguments
export function listConfigSections() {
  return freeze({
    aliases: aliasesSection,
    build: buildSection,
    cache: cacheSection,
    debug: debugSection,
    define: defineSection,
    format: formatSection,
    preset: presetSection,
    structure: structureOptionsSection,
    traits: traitAdjustmentsSection,
    agents: agentsSection,
    git: gitSection,
    github: githubSection,
    prettier: prettierSection,
    typescript: typescriptOptionsSection,
    vscode: vscodeSection,
    bin: binOptionsSection,
    data: dataSection,
    runtime: runtimeSection,
    scripts: scriptsOptionsSection,
    src: sourceOptionsSection,
    tests: testsOptionsSection,
    tooling: toolingOptionsSection,
    workspaces: workspacesSection,
    visibility: visibilitySection,
  });
}
