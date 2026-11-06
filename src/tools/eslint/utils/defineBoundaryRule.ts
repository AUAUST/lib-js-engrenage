import { relative } from "node:path";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { analyzeImports } from "#tools/eslint/utils/analyzeImports";
import { visitImportSources } from "#tools/eslint/utils/visitImportSources";
import type {
  BoundaryCause,
  BoundaryViolation,
  Entity,
  ImportKind,
} from "#project/structure/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { Directory } from "#types/Directory";

export function defineBoundaryRule({
  config,
  description,
  check,
  messages,
}: {
  config: ConventionConfig;
  description: string;
  check(
    importer: Entity,
    target: Entity,
    kind: ImportKind,
  ): BoundaryViolation | undefined;
  messages: Readonly<Record<BoundaryCause, string>>;
}): RuleModule {
  function within(base: Directory, path: string): string {
    return toPosixPath(
      relative(resolve(config.root, base), resolve(config.root, path)),
    );
  }

  function render(
    { importer, target, boundary, fix }: BoundaryViolation,
    file: string,
    targetFile: string,
    specifier: string,
  ): Record<string, string> {
    const environment = importer.lineage[0]?.path ?? importer.path;
    const owner = importer.lineage.at(-1)?.path ?? environment;
    const boundaryPath = boundary?.path ?? environment;

    const boundaryName =
      boundaryPath === environment
        ? environment
        : within(environment, boundaryPath);

    return {
      file: within(environment, file),
      module: within(owner, file),
      domain: importer.domain ?? within(environment, file),
      target: within(boundaryPath, targetFile),
      targetDomain: target.domain ?? within(environment, targetFile),
      boundary: boundaryName,
      order: boundary?.layers?.join(" < ") ?? "",
      specifier,
      fix:
        fix === undefined ? `the index of \`${boundaryName}\`` : `\`${fix}\``,
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
      const analysis = analyzeImports(config, context);
      const { importer } = analysis;

      if (importer === undefined) {
        return {};
      }

      return visitImportSources((node, specifier) => {
        const { resolved, kind, target } = analysis.analyze(node, specifier);

        if (
          target === undefined ||
          (resolved?.kind !== "relative" && resolved?.kind !== "alias")
        ) {
          return;
        }

        const violation = check(importer, target, kind);

        if (violation !== undefined) {
          context.report({
            node,
            messageId: violation.cause,
            data: render(violation, context.filename, resolved.path, specifier),
          });
        }
      });
    },
  };
}
