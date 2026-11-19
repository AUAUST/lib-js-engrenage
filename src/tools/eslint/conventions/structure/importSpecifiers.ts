import { relative } from "node:path";

import { freeze, values } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import type {
  BoundaryCause,
  BoundaryViolation,
  ImportEdge,
} from "#project/structure/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function violation(cause: BoundaryCause, fix?: string): BoundaryViolation {
  return freeze({
    cause,
    boundary: undefined,
    fix,
  });
}

function isWithin(path: string, directory: Directory): boolean {
  return path.startsWith(`${directory}/`);
}

export default defineConvention({
  sections: {
    structure: "structure",
    entities: "entities",
    resolveImport: "importResolver",
    grants: "importGrants",
  },
  rule: ({ grants, ...graph }, { root }) => {
    const { entities, structure } = graph;

    const unclassified = values(structure).flatMap((environment) => {
      return environment?.unclassified.map(({ path }) => path) ?? [];
    });

    function unknownPath(file: File): BoundaryViolation {
      const path = toPosixPath(relative(root, resolve(root, file)));

      const directory = unclassified.find((candidate) => {
        return isWithin(path, candidate);
      });

      return directory === undefined
        ? violation("unknownPath")
        : freeze({
            ...violation("unclassifiedPath"),
            unclassified: directory,
          });
    }

    // @debt the check lives in the convention rather than `project/structure` with the other checks, because it needs the entity index
    function check({
      file,
      importer,
      resolved,
      targetFile,
      target,
    }: ImportEdge): BoundaryViolation | undefined {
      if (importer === undefined && entities.withinEnvironment(file)) {
        return unknownPath(file);
      }

      // @debt an unknown path may be a file created after the index was built; refresh the index instead once config loading can (#247)
      if (resolved === undefined) {
        return violation("unknownPath");
      }

      if (targetFile === undefined) {
        return;
      }

      if (targetFile === toPosixPath(relative(root, resolve(root, file)))) {
        return violation("selfImport");
      }

      if (target === undefined && entities.withinEnvironment(targetFile)) {
        return unknownPath(targetFile);
      }

      const fix = resolved.kind === "relative"
        ? entities.specifierOf(targetFile)
        : undefined;

      return fix === undefined ? undefined : violation("relativePath", fix);
    }

    return defineBoundaryRule({
      root,
      graph,
      grants,
      description: "A specifier names a path the structure map knows, through its alias rather than a relative path, and never the importing file itself.",
      check,
      messages: boundaryMessages,
    });
  },
});
