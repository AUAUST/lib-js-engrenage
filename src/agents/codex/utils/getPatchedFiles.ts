import { deduplicate } from "@auaust/primitive-kit/arrays";

import type { Files } from "#types/Files";

export function getPatchedFiles(patch: string): Files {
  const lines = patch.trim().split(/\r?\n/);

  if (lines[0] !== "*** Begin Patch" || lines.at(-1) !== "*** End Patch") {
    throw new Error("Invalid Codex patch envelope");
  }

  const files: string[] = [];

  for (const [index, line] of lines.entries()) {
    const match = /^\*\*\* (?:Add|Update) File: (.+)$/.exec(line);
    const file = match?.[1];

    if (file === undefined) {
      continue;
    }

    const moved = /^\*\*\* Move to: (.+)$/.exec(lines[index + 1] ?? "")?.[1];
    files.push(moved ?? file);
  }

  return deduplicate(files);
}
