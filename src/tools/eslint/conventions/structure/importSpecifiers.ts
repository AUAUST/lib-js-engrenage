import { relative } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { boundaryMessages } from "#tools/eslint/constants";
import { defineBoundaryRule } from "#tools/eslint/utils/defineBoundaryRule";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import type {
  BoundaryCause,
  BoundaryViolation,
  ImportEdge,
} from "#project/structure/index";

function violation(cause: BoundaryCause, fix?: string): BoundaryViolation {
  return freeze({
    cause,
    boundary: undefined,
    fix,
  });
}

export default defineConvention({
  rule: (config) => {
    const { entities, root } = config;

    function check({
      file,
      importer,
      resolved,
      targetFile,
      target,
    }: ImportEdge): BoundaryViolation | undefined {
      if (importer === undefined && entities.withinEnvironment(file)) {
        return violation("unknownPath");
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
        return violation("unknownPath");
      }

      const fix =
        resolved.kind === "relative"
          ? entities.specifierOf(targetFile)
          : undefined;

      return fix === undefined ? undefined : violation("relativePath", fix);
    }

    return defineBoundaryRule({
      config,
      description:
        "A specifier names a path the structure map knows, through its alias rather than a relative path, and never the importing file itself.",
      check,
      messages: boundaryMessages,
    });
  },
});
