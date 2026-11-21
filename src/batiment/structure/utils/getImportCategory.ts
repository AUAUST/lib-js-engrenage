import { getEnvironmentCategory } from "#batiment/structure/utils/getEnvironmentCategory";
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
    case "dist": {
      return "dist-artefacts";
    }

    case undefined: {
      return;
    }

    default: {
      return getEnvironmentCategory(environment);
    }
  }
}
