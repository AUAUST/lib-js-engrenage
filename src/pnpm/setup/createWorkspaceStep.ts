import { map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { workspaceFile, workspaceSettings } from "#pnpm/constants";
import type { WorkspaceSettings } from "#pnpm/types/WorkspaceSettings";
import type { Step } from "#support/scaffold/types/Step";

function renderWorkspace({
  allowBuilds,
  minimumReleaseAgeExclude,
}: WorkspaceSettings): string {
  const builds = map(entries(allowBuilds), ([name, allowed]) => {
    return `  ${JSON.stringify(name)}: ${allowed}`;
  });

  const excluded = map(minimumReleaseAgeExclude, (pattern) => {
    return `  - ${JSON.stringify(pattern)}`;
  });

  return [
    "allowBuilds:",
    ...builds,
    "minimumReleaseAgeExclude:",
    ...excluded,
    "",
  ].join("\n");
}

export function createWorkspaceStep(): Step {
  return {
    name: workspaceFile,
    message: `Create ${workspaceFile} with the settings engrenage needs to install?`,
    isMissing({ filesystem }) {
      return !filesystem.exists(workspaceFile);
    },
    plan({ filesystem }) {
      filesystem.write(workspaceFile, renderWorkspace(workspaceSettings));
    },
  };
}
