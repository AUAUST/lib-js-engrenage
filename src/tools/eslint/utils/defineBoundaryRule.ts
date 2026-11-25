import { relative } from "node:path";

import { freeze, getOwn } from "@auaust/toolkit/object";

import {
  getTargetScope,
  type BoundaryCause,
  type BoundaryViolation,
  type ImportCategory,
  type ImportEdge,
  type ImportGrants,
} from "#batiment/structure/index";
import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { analyzeImports } from "#tools/eslint/utils/analyzeImports";
import { visitImportSources } from "#tools/eslint/utils/visitImportSources";
import type { ImportGraph } from "#tools/eslint/apis/ImportGraph";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { Directory } from "#types/Directory";

const projectRoot = ".";

const categoryLabels: Readonly<Record<ImportCategory, string>> = freeze({
  "public-entries": "the package name",
  "internal-aliases": "`src` modules",
  "dist-artefacts": "the build output",
});

function labelCategory(category: ImportCategory): string {
  return getOwn(categoryLabels, category) ?? `\`${category}\` files`;
}

const variantGuidance = freeze({
  plain: {
    reach: "a test of source and dist reaches source only through the package name",
    move: "a source-only test",
  },
  src: {
    reach: "a source-only test imports internals, never the package name",
    move: "a test of source and dist",
  },
  dist: {
    reach: "a dist-only test reaches source only through the package name and the build output",
    move: "a source-only test",
  },
} as const satisfies Record<
  string,
  { readonly reach: string; readonly move: string }
>);

export function defineBoundaryRule({
  root,
  graph,
  grants,
  description,
  check,
  messages,
}: {
  root: Directory;
  graph: ImportGraph;
  grants: ImportGrants;
  description: string;
  check(edge: ImportEdge, grants: ImportGrants): BoundaryViolation | undefined;
  messages: Readonly<Record<BoundaryCause, string>>;
}): RuleModule {
  function within(base: Directory, path: string): string {
    return toPosixPath(relative(resolve(root, base), resolve(root, path)));
  }

  function render(
    { boundary, fix, category, unclassified = "" }: BoundaryViolation,
    edge: ImportEdge,
  ): Record<string, string> {
    const {
      file,
      importer,
      specifier,
      targetFile: targetPath = specifier,
      target,
    } = edge;

    const environment = (
      importer?.lineage[0]?.path ?? importer?.path ?? projectRoot
    );

    const owner = importer?.lineage.at(-1)?.path ?? environment;
    const boundaryPath = boundary?.path ?? environment;
    const path = within(projectRoot, file);

    // @debt a boundary in another environment or another directory of the importer's namespace renders relative to the importer's directory, as `../admin/…`
    const boundaryName = boundaryPath === environment
      ? environment
      : within(environment, boundaryPath);

    const guidance = importer?.variant === undefined
      ? undefined
      : getOwn(variantGuidance, importer.variant);

    return {
      file: within(environment, file),
      module: within(owner, file),
      domain: importer?.domain ?? within(environment, file),
      target: within(boundaryPath, targetPath),
      targetDomain: target?.domain ?? within(environment, targetPath),
      boundary: boundaryName,
      order: boundary?.layers?.join(" < ") ?? "",
      specifier,
      fix: fix === undefined
        ? `the index of \`${boundaryName}\``
        : `\`${fix}\``,
      path,
      targetPath,
      namespace: importer?.namespace ?? "",
      category: category === undefined ? "" : labelCategory(category),
      scope: importer?.scope ?? "",
      targetScope: getTargetScope(edge) ?? "",
      variantReach: guidance?.reach ?? "",
      variantMove: guidance?.move ?? "",
      unknown: importer === undefined ? path : targetPath,
      unclassified,
    };
  }

  return {
    meta: {
      type: "problem",
      docs: { description },
      messages,
      schema: [],
    },
    create(context) {
      const analysis = analyzeImports(graph, context);

      return visitImportSources((node, specifier) => {
        const edge = analysis.edgeOf(node, specifier);
        const violation = check(edge, grants);

        if (violation !== undefined) {
          context.report({
            node,
            messageId: violation.cause,
            data: render(violation, edge),
          });
        }
      });
    },
  };
}
