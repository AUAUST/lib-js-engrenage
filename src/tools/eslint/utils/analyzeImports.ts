import { extname } from "node:path";

import type { Rule, SourceCode } from "eslint";

import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type { Entity, ImportEdge } from "#project/structure/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

interface ImportAnalysis {
  edgeOf(node: Rule.Node, specifier: string): ImportEdge;
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

// @debt forces the importer's source extension onto every target, so a `.json` or `.tsx` target gets a wrong path
function withExtension(path: string, extension: string): string {
  return `${path.slice(0, path.length - extname(path).length)}${extension}`;
}

function createAnalysis(
  config: ConventionConfig,
  filename: string,
): ImportAnalysis {
  const importer = config.entities.entityOf(filename);
  const extension = sourceExtensionOf(config, importer, filename);
  const edges = new Map<Rule.Node, ImportEdge>();

  function edgeOf(node: Rule.Node, specifier: string): ImportEdge {
    const known = edges.get(node);

    if (known !== undefined) {
      return known;
    }

    const resolved = config.resolveImport(specifier, filename);

    const targetFile =
      resolved?.kind === "relative" || resolved?.kind === "alias"
        ? withExtension(resolved.path, extension)
        : undefined;

    const edge: ImportEdge = {
      file: filename,
      importer,
      specifier,
      resolved,
      targetFile,
      target:
        targetFile === undefined
          ? undefined
          : config.entities.entityOf(targetFile),
      kind: isTypeOnlyNode(node) ? "type" : "runtime",
    };

    edges.set(node, edge);

    return edge;
  }

  return { edgeOf };
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
