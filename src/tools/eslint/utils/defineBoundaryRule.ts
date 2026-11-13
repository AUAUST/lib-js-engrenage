import { relative } from "node:path";

import { freeze, getOwn } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { analyzeImports } from "#tools/eslint/utils/analyzeImports";
import { visitImportSources } from "#tools/eslint/utils/visitImportSources";
import type {
  BoundaryCause,
  BoundaryViolation,
  ImportCategory,
  ImportEdge,
  ImportGrants,
  TestVariant,
} from "#project/structure/index";
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
    reach: "a test of source and dist imports the package name",
    move: "a source-only test",
  },
  src: {
    reach: "a source-only test imports internals, never the package name",
    move: "a test of source and dist",
  },
  dist: {
    reach: "a dist-only test imports the package name and the build output",
    move: "a source-only test",
  },
} as const satisfies Record<
  TestVariant,
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
    { boundary, fix, category }: BoundaryViolation,
    {
      file,
      importer,
      specifier,
      targetFile: targetPath = specifier,
      target,
    }: ImportEdge,
  ): Record<string, string> {
    const environment = (
      importer?.lineage[0]?.path ?? importer?.path ?? projectRoot
    );

    const owner = importer?.lineage.at(-1)?.path ?? environment;
    const boundaryPath = boundary?.path ?? environment;
    const path = within(projectRoot, file);

    // @debt a boundary in another environment renders relative to the importer's environment, as `../src/…`
    const boundaryName = boundaryPath === environment
      ? environment
      : within(environment, boundaryPath);

    const guidance = importer?.variant === undefined
      ? undefined
      : variantGuidance[importer.variant];

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
      environment: importer?.environment ?? "",
      category: category === undefined ? "" : labelCategory(category),
      workspace: environment,
      targetWorkspace: target?.path ?? targetPath,
      variantReach: guidance?.reach ?? "",
      variantMove: guidance?.move ?? "",
      unknown: importer === undefined ? path : targetPath,
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
