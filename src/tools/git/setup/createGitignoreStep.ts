import { flat, pluck } from "@auaust/primitive-kit/arrays";

import { gitignoreFile } from "#constants";
import { relativeWithin } from "#foundation/filesystem/utils/relativeWithin";
import { defaultIgnores, ignoreBlocks } from "#tools/git/constants";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { Step } from "#workflows/cli/types/Step";

const ignoreMarker = /^# @ignore /m;

function resolveFile({ root, git }: ResolvedConfig): File {
  const { gitignore } = git;

  return gitignore === undefined
    ? gitignoreFile
    : relativeWithin(root, gitignore);
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
    isMissing({ config, filesystem }) {
      const content = filesystem.read(resolveFile(config));

      return content === undefined || !ignoreMarker.test(content);
    },
    plan({ config, filesystem }) {
      const file = resolveFile(config);

      const covered = new Set(flat(pluck(defaultIgnores, "globs")));

      const remaining = removeCovered(filesystem.read(file) ?? "", covered);

      filesystem.write(
        file,
        remaining === "" ? ignoreBlocks : `${ignoreBlocks}\n${remaining}\n`,
      );
    },
  };
}
