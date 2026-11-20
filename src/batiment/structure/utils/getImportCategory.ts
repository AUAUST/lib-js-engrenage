import { sourceEnvironment } from "#batiment/structure/constants";
import { isEntryReference } from "#batiment/structure/utils/isEntryReference";
import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { ImportEdge } from "#batiment/structure/types/ImportEdge";

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
