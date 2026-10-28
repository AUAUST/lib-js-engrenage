import { isMap, parseDocument } from "yaml";

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

function addMissingBuildApprovals(content: string): string {
  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${workspaceFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${workspaceFile} must contain a YAML mapping`);
  }

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
    isMissing({ filesystem }) {
      const content = filesystem.read(workspaceFile);

      return (
        content === undefined || addMissingBuildApprovals(content) !== content
      );
    },
    plan({ filesystem }) {
      const content = filesystem.read(workspaceFile);

      filesystem.write(
        workspaceFile,
        content === undefined
          ? renderWorkspace(workspaceSettings)
          : addMissingBuildApprovals(content),
      );
    },
  };
}
