import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportEdge } from "#project/structure/types/ImportEdge";

export function getImportCategory({
  resolved,
  target,
}: ImportEdge): ImportCategory | undefined {
  if (resolved?.kind === "self") {
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
