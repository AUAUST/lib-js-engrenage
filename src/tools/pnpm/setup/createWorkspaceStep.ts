import { map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { workspaceFile, workspaceSettings } from "#tools/pnpm/constants";
import { addWorkspaceSettings } from "#tools/pnpm/utils/addWorkspaceSettings";
import { parseWorkspaceDocument } from "#tools/pnpm/utils/parseWorkspaceDocument";
import type { Step } from "#project/steps/index";
import type { WorkspaceSettings } from "#tools/pnpm/types/WorkspaceSettings";

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

function addMissingSettings(content: string): string {
  const document = parseWorkspaceDocument(content);

  return addWorkspaceSettings(document) ? document.toString() : content;
}

export function createWorkspaceStep(): Step {
  return {
    name: workspaceFile,
    message: `Add missing install settings to ${workspaceFile}, preserving existing choices?`,
    async isMissing({ filesystem }) {
      const content = await filesystem.read(workspaceFile);

      return content === undefined || addMissingSettings(content) !== content;
    },
    async plan({ filesystem }) {
      const content = await filesystem.read(workspaceFile);

      await filesystem.write(
        workspaceFile,
        content === undefined
          ? renderWorkspace(workspaceSettings)
          : addMissingSettings(content),
      );
    },
  };
}
