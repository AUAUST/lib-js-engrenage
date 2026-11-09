import { sourceEnvironment } from "#project/structure/constants";
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

  const environment = target?.environment;

  switch (environment) {
    case sourceEnvironment: {
      return "internal-aliases";
    }

    case "dist": {
      return "dist-artefacts";
    }

    case "workspace":
    case undefined: {
      return;
    }

    default: {
      return environment;
    }
  }
}
