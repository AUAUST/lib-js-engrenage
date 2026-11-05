import { isMap } from "yaml";

import { map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { workspaceFile, workspaceSettings } from "#tools/pnpm/constants";
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

function addMissingBuildApprovals(content: string): string {
  const document = parseWorkspaceDocument(content);

  const builds = document.get("allowBuilds", true);

  if (builds !== undefined && !isMap(builds)) {
    throw new Error(`allowBuilds in ${workspaceFile} must be a YAML mapping`);
  }

  let changed = false;

  for (const [name, allowed] of entries(workspaceSettings.allowBuilds)) {
    const path = ["allowBuilds", name];

    if (document.hasIn(path)) {
      continue;
    }

    document.setIn(path, allowed);

    changed = true;
  }

  return changed ? document.toString() : content;
}

export function createWorkspaceStep(): Step {
  return {
    name: workspaceFile,
    message: `Add missing install settings to ${workspaceFile}, preserving existing choices?`,
    async isMissing({ filesystem }) {
      const content = await filesystem.read(workspaceFile);

      return (
        content === undefined || addMissingBuildApprovals(content) !== content
      );
    },
    async plan({ filesystem }) {
      const content = await filesystem.read(workspaceFile);

      await filesystem.write(
        workspaceFile,
        content === undefined
          ? renderWorkspace(workspaceSettings)
          : addMissingBuildApprovals(content),
      );
    },
  };
}
