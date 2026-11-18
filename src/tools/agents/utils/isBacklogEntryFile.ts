import { posix } from "node:path";

import { backlogIndex } from "#tools/agents/constants";

export function isBacklogEntryFile(file: string): boolean {
  return (
    file !== backlogIndex &&
    posix.dirname(file) === posix.dirname(backlogIndex) &&
    posix.extname(file) === ".md"
  );
}
