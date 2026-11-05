import { flat, pluck } from "@auaust/primitive-kit/arrays";

import { gitignoreFile } from "#constants";
import { relativeWithin } from "#foundation/filesystem/index";
import { defaultIgnores, ignoreBlocks } from "#tools/git/constants";
import type { Step } from "#project/steps/index";
import type { ResolvedGit } from "#tools/git/types/ResolvedGit";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const ignoreMarker = /^# @ignore /m;

function resolveFile(root: Directory, { gitignore }: ResolvedGit): File {
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

export function createGitignoreStep(): Step<{
  root: Directory;
  git: ResolvedGit;
}> {
  return {
    name: gitignoreFile,
    message: `Add the engrenage ignore blocks to ${gitignoreFile}?`,
    async isMissing({ get, filesystem }) {
      const content = filesystem.read(
        resolveFile(await get("root"), await get("git")),
      );

      return content === undefined || !ignoreMarker.test(content);
    },
    async plan({ get, filesystem }) {
      const file = resolveFile(await get("root"), await get("git"));

      const covered = new Set(flat(pluck(defaultIgnores, "globs")));

      const remaining = removeCovered(filesystem.read(file) ?? "", covered);

      filesystem.write(
        file,
        remaining === "" ? ignoreBlocks : `${ignoreBlocks}\n${remaining}\n`,
      );
    },
  };
}
