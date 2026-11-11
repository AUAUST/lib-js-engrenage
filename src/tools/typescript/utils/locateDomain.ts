import { posix } from "node:path";

import { isBelow } from "#tools/typescript/utils/isBelow";
import type {
  EnvironmentStructure,
  StructureNode,
} from "#project/structure/index";
import type { Directory } from "#types/Directory";

export function locateDomain(
  { dirs }: EnvironmentStructure,
  node: StructureNode,
): Directory {
  const directory = dirs.find((candidate) => isBelow(candidate, node.path));

  return directory === undefined || directory === node.path
    ? ""
    : posix.relative(directory, node.path);
}
