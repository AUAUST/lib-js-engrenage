import { flat, pluck } from "@auaust/primitive-kit/arrays";

import { gitignoreFile } from "#constants";
import { defaultIgnores, ignoreBlocks } from "#git/constants";
import { createProjectIgnores } from "#git/utils/createProjectIgnores";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Step } from "#support/scaffold/types/Step";
import type { File } from "#types/File";

const ignoreMarker = /^# @ignore /m;

function resolveFile({ root, gitignorePath }: ResolvedConfig): File {
  return gitignorePath === undefined
    ? gitignoreFile
    : relativeWithin(root, gitignorePath);
}

function isEntry(line: string): boolean {
  const trimmed = line.trim();

  return trimmed !== "" && !trimmed.startsWith("#");
}

function removeCovered(content: string, covered: ReadonlySet<string>): string {
  const groups: string[] = [];

  for (const group of content.split(/\n\s*\n/)) {
    const lines = group.split("\n").filter((line) => !covered.has(line.trim()));

    if (lines.some(isEntry)) {
      groups.push(lines.join("\n").trim());
    }
  }

  return groups.join("\n\n");
}

export function createGitignoreStep(): Step {
  return {
    name: gitignoreFile,
    message: `Add the engrenage ignore blocks to ${gitignoreFile}?`,
    isMissing({ config, files }) {
      const content = files.read(resolveFile(config));

      return content === undefined || !ignoreMarker.test(content);
    },
    plan({ config, files }) {
      const file = resolveFile(config);

      const groups = [...defaultIgnores, ...createProjectIgnores(config)];

      const covered = new Set(flat(pluck(groups, "globs")));

      const remaining = removeCovered(files.read(file) ?? "", covered);

      files.write(
        file,
        remaining === "" ? ignoreBlocks : `${ignoreBlocks}\n${remaining}\n`,
      );
    },
  };
}
