import { globSync } from "node:fs";

import type { Directory } from "#types/Directory";

export function hasConfigFile(root: Directory, tool: string): boolean {
  return (
    globSync(`${tool}.config.*`, {
      cwd: root,
    }).length > 0
  );
}
