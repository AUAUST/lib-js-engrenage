import { extname } from "node:path";

import type { Rule, SourceCode } from "eslint";

import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type {
  Entity,
  ImportKind,
  ResolvedSpecifier,
} from "#project/structure/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

interface AnalyzedImport {
  readonly resolved: ResolvedSpecifier | undefined;
  readonly kind: ImportKind;
  readonly target: Entity | undefined;
}

interface ImportAnalysis {
  readonly importer: Entity | undefined;
  analyze(node: Rule.Node, specifier: string): AnalyzedImport;
}

const analyses = new WeakMap<
  ConventionConfig,
  WeakMap<SourceCode, ImportAnalysis>
>();

// @debt lists the environments without a structure by name instead of deriving them from the structure configuration
function sourceExtensionOf(
  config: ConventionConfig,
  importer: Entity | undefined,
  filename: string,
): string {
  const environment = importer?.environment;

  const structure =
    environment === undefined ||
    environment === "data" ||
    environment === "dist" ||
    environment === "workspace"
      ? undefined
      : config.structure[environment];

  return extname(structure?.indexFile ?? filename);
}

function withExtension(path: string, extension: string): string {
  return `${path.slice(0, path.length - extname(path).length)}${extension}`;
}

function createAnalysis(
  config: ConventionConfig,
  filename: string,
): ImportAnalysis {
  const importer = config.entities.entityOf(filename);
  const extension = sourceExtensionOf(config, importer, filename);
  const analyzed = new Map<Rule.Node, AnalyzedImport>();

  function analyze(node: Rule.Node, specifier: string): AnalyzedImport {
    const known = analyzed.get(node);

    if (known !== undefined) {
      return known;
    }

    const resolved = config.resolveImport(specifier, filename);

    const target =
      resolved?.kind === "relative" || resolved?.kind === "alias"
        ? config.entities.entityOf(withExtension(resolved.path, extension))
        : undefined;

    const result: AnalyzedImport = {
      resolved,
      kind: isTypeOnlyNode(node) ? "type" : "runtime",
      target,
    };

    analyzed.set(node, result);

    return result;
  }

  return { importer, analyze };
}

export function analyzeImports(
  config: ConventionConfig,
  context: Rule.RuleContext,
): ImportAnalysis {
  let files = analyses.get(config);

  if (files === undefined) {
    files = new WeakMap();
    analyses.set(config, files);
  }

  let analysis = files.get(context.sourceCode);

  if (analysis === undefined) {
    analysis = createAnalysis(config, context.filename);
    files.set(context.sourceCode, analysis);
  }

  return analysis;
}
