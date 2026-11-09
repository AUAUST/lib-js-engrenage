import { isEntryReference } from "#project/structure/utils/isEntryReference";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportEdge } from "#project/structure/types/ImportEdge";

export function getImportCategory(
  edge: ImportEdge,
): ImportCategory | undefined {
  const { resolved, target } = edge;

  if (isEntryReference(edge) || resolved?.kind === "self") {
    return "public-entries";
  }

  switch (target?.environment) {
    case "src": {
      return "internal-aliases";
    }

    case "dist": {
      return "dist-artefacts";
    }

    case "bin":
    case "scripts":
    case "data":
    case "tests": {
      return target.environment;
    }

    case "tooling":
    case "workspace":
    case undefined: {
      break;
    }
  }
}
