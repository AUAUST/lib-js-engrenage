import type { Rule, SourceCode } from "eslint";

import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";
import type { EntityIndex, ImportEdge } from "#batiment/structure/index";
import type { ImportGraph } from "#tools/eslint/apis/ImportGraph";

interface ImportAnalysis {
  edgeOf(node: Rule.Node, specifier: string): ImportEdge;
}

// @debt keyed by the entity index alone, so it holds only while the structure and import resolver come from the same loaded config as the index
const analyses = new WeakMap<
  EntityIndex,
  WeakMap<SourceCode, ImportAnalysis>
>();

function createAnalysis(graph: ImportGraph, filename: string): ImportAnalysis {
  const importer = graph.entities.entityOf(filename);
  const edges = new Map<Rule.Node, ImportEdge>();

  function edgeOf(node: Rule.Node, specifier: string): ImportEdge {
    const known = edges.get(node);

    if (known !== undefined) {
      return known;
    }

    const resolved = graph.resolveImport(specifier, filename);

    const targetFile = (
      resolved?.kind === "relative" || resolved?.kind === "alias"
    )
      ? resolved.path
      : undefined;

    const edge: ImportEdge = {
      file: filename,
      importer,
      specifier,
      resolved,
      targetFile,
      target: targetFile === undefined
        ? undefined
        : graph.entities.entityOf(targetFile),
      kind: isTypeOnlyNode(node) ? "type" : "runtime",
    };

    edges.set(node, edge);

    return edge;
  }

  return { edgeOf };
}

export function analyzeImports(
  graph: ImportGraph,
  context: Rule.RuleContext,
): ImportAnalysis {
  let files = analyses.get(graph.entities);

  if (files === undefined) {
    files = new WeakMap();
    analyses.set(graph.entities, files);
  }

  let analysis = files.get(context.sourceCode);

  if (analysis === undefined) {
    analysis = createAnalysis(graph, context.filename);
    files.set(context.sourceCode, analysis);
  }

  return analysis;
}
